"""Attach school labels to extracted polygons using PDF label locations.
Ambiguous or unlabeled polygons stay explicitly unresolved; never nearest-school guesses.
"""
import json,re
from pathlib import Path
from extract_boundaries import projection
root=Path(__file__).resolve().parent.parent/'public/data'

def inside(ring,p):
 x,y=p;hit=False
 for a,b in zip(ring,ring[1:]):
  if (a[1]>y)!=(b[1]>y) and x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]:hit=not hit
 return hit

def groups(lines):
 result=[]
 for line in lines:
  if not 11.9<line['font_size']<12.1 or line['bbox'][1]<432:continue
  box=line['bbox']
  if result and abs(result[-1][-1]['bbox'][1]-box[3])<2 and abs(result[-1][-1]['bbox'][0]-box[0])<65:result[-1].append(line)
  else:result.append([line])
 return result

def school(group,level):
 text=' '.join(x['text'] for x in group)
 if any(word in text for word in ['Closed','Focus/','Focus/Option','Building','Rightsizing','Version:']):return None
 if level=='high':
  match=re.match(r'(Grant|Lincoln|Jefferson|Cleveland|Franklin|Roosevelt|McDaniel|Wells-Barnett)\b',text)
  return match[1]+' High School' if match else None
 if level=='middle' and not ('Middle' in text or 'K-8' in text):return None
 if level=='elementary' and not ('K-5' in text or 'K-8' in text or 'Neighborhood' in text):return None
 name=re.split(r'\s+(?:K-5|K-8|Middle|School|Neighborhood)',text)[0]
 return name+(' K–8' if 'K-8' in text else ' Middle School' if level=='middle' else ' Elementary School')

for path in sorted(root.glob('*.geojson')):
 fc=json.loads(path.read_text());level=path.stem.split('-')[1];meta=fc['metadata'];bbox=meta['pdf_viewport'];gpts=meta['control_points'];fw,inv=projection()
 # Control points are ordered upper-left, lower-left, lower-right, upper-right.
 controls={(0,1):fw(*gpts[:2]),(0,0):fw(*gpts[2:4]),(1,0):fw(*gpts[4:6]),(1,1):fw(*gpts[6:8])}
 def geo(p):
  u=(p[0]-bbox[0])/(bbox[2]-bbox[0]);v=(p[1]-bbox[1])/(bbox[3]-bbox[1]);xy=[0,0]
  for (cx,cy),pt in controls.items():
   weight=(u if cx else 1-u)*(v if cy else 1-v);xy=[xy[k]+pt[k]*weight for k in range(2)]
  return inv(*xy)
 labels=[]
 for group in groups(json.loads((root/(path.stem+'-labels.json')).read_text())):
  name=school(group,level)
  if not name:continue
  # Labels in the northwest inset use another coordinate system; do not match these here.
  box=group[0]['bbox']
  if box[0]<674 and box[1]<1334:continue
  labels.append({'name':name,'point':geo([(box[0]+box[2])/2,(box[1]+box[3])/2]),'source_label':' '.join(x['text'] for x in group)})
 for f in fc['features']:
  candidates=[label for label in labels if inside(f['geometry']['coordinates'][0],label['point'])]
  unique=sorted(set(c['name'] for c in candidates));p=f['properties'];p['school_candidates']=unique;p['school_name']=unique[0] if len(unique)==1 else None;p['name_status']='pdf-label-match' if len(unique)==1 else 'ambiguous' if unique else 'unresolved'
  if len(unique)==1:p['source_label']=next(c['source_label'] for c in candidates if c['name']==unique[0])
 meta['notes']='Names matched using PDF school labels inside vector polygons. Unresolved and ambiguous matches remain explicit. Geometry is approximate; inset coverage and topology require review.'
 path.write_text(json.dumps(fc,separators=(',',':')))
 print(path.stem,':',sum(bool(f['properties']['school_name']) for f in fc['features']),'/',len(fc['features']),'named; candidates',[(f['properties']['boundary_id'],f['properties']['school_candidates'])for f in fc['features'] if len(f['properties']['school_candidates'])>1])
