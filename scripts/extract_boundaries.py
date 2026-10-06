"""Extract georeferenced vector subpaths from PPS PDFs. Provisional geometry only."""
import hashlib,json,math,re,sys,zlib
from pathlib import Path

def objects(b):
    objs={int(m[1]):m[2] for m in re.finditer(rb'(\d+) 0 obj\s*(.*?)endobj',b,re.S)}
    for o in list(objs.values()):
        if b'/Type/ObjStm' not in o:continue
        s=zlib.decompress(re.search(rb'stream\r?\n(.*?)\r?\nendstream',o,re.S)[1]);first=int(re.search(rb'/First\s*(\d+)',o)[1]);ns=list(map(int,s[:first].split()))
        for j in range(0,len(ns),2):objs[ns[j]]=s[first+ns[j+1]:first+ns[j+3] if j+3<len(ns) else len(s)]
    return objs

def pdfstring(s):
    s=re.sub(rb'\\([0-7]{1,3})',lambda m:bytes([int(m[1],8)]),s);s=re.sub(rb'\\([()\\])',rb'\1',s)
    return s.decode('utf-16') if s.startswith(b'\xfe\xff') else s.decode('latin1')

def multiply(a,b):
    A,B,C,D,E,F=a;g,h,i,j,k,l=b
    return [A*g+C*h,B*g+D*h,A*i+C*j,B*i+D*j,A*k+C*l+E,B*k+D*l+F]

def transform(a,p):
    x,y=p;A,B,C,D,E,F=a;return [A*x+C*y+E,B*x+D*y+F]

def projection():
    e=math.sqrt(1-(1-1/298.257222101)**2);a=6378137;rad=math.pi/180
    def t(p):return math.tan(math.pi/4-p/2)/((1-e*math.sin(p))/(1+e*math.sin(p)))**(e/2)
    def m(p):return math.cos(p)/math.sqrt(1-e*e*math.sin(p)**2)
    p1,p2,p0=[d*rad for d in [44.33333333333334,46,43.66666666666666]]
    n=math.log(m(p1)/m(p2))/math.log(t(p1)/t(p2));F=m(p1)/(n*t(p1)**n);r0=a*F*t(p0)**n
    def forward(lat,lon):
        r=a*F*t(lat*rad)**n;th=n*(lon+120.5)*rad;return [2500000+r*math.sin(th),r0-r*math.cos(th)]
    def inverse(x,y):
        x-=2500000;r=math.hypot(x,r0-y);th=math.atan2(x,r0-y);tt=(r/(a*F))**(1/n);p=math.pi/2-2*math.atan(tt)
        for _ in range(12):p=math.pi/2-2*math.atan(tt*((1-e*math.sin(p))/(1+e*math.sin(p)))**(e/2))
        return [round(-120.5+th/n/rad,7),round(p/rad,7)]
    return forward,inverse

def extract(path):
    b=path.read_bytes();objs=objects(b);layers={}
    for i,o in objs.items():
        if b'/Type/OCG' in o:
            name=re.search(rb'/Name\((.*)\)/Type/OCG',o)
            if name:layers['Layer_'+str(i)]=pdfstring(name[1])
    searchable=b+b'\n'+b'\n'.join(objs.values())
    vp=re.search(rb'/VP\[.*?/BBox\[([^]]+)\].*?/GPTS\[([^]]+)\].*?/LPTS\[([^]]+)\]',searchable,re.S)
    georef_source=path.name
    if not vp:
        reference=path.parent/'current-high.pdf'
        vp=re.search(rb'/VP\[.*?/BBox\[([^]]+)\].*?/GPTS\[([^]]+)\].*?/LPTS\[([^]]+)\]',reference.read_bytes(),re.S)
        georef_source=reference.name+' (shared page alignment; requires geographic QA)'
    if not vp:raise ValueError('No supported geographic viewport')
    bbox=list(map(float,vp[1].split()));gpts=list(map(float,vp[2].split()));lpts=list(map(float,vp[3].split()));fw,inv=projection()
    controls={tuple(lpts[j:j+2]):fw(*gpts[j:j+2]) for j in range(0,8,2)}
    def geo(p):
        u=(p[0]-bbox[0])/(bbox[2]-bbox[0]);v=(p[1]-bbox[1])/(bbox[3]-bbox[1]);xy=[0,0]
        for (cx,cy),pt in controls.items():
            weight=(u if cx else 1-u)*(v if cy else 1-v);xy=[xy[i]+pt[i]*weight for i in range(2)]
        return inv(*xy)
    streams=[]
    for o in objs.values():
        match=re.search(rb'stream\r?\n(.*?)\r?\nendstream',o,re.S)
        if match and b'/Filter/FlateDecode' in o:
            try:s=zlib.decompress(match[1])
            except zlib.error:continue
            if b' cm' in s and b' SCN' in s:streams.append(s)
    s=max(streams,key=len).decode('latin1');ctm=[1,0,0,1,0,0];stack=[];marked=[];rings=[];ring=[];features=[];stroke=[]
    def is_boundary():
        return 'GGS_Boundaries_AllScenarios' in marked or (not layers and stroke in ([0.85409,0.66987,0.0],[0.8416,0.66006,0.0],[0.0,0.6125,0.57128],[0.0,0.40784,0.38039],[0.0,0.32554,0.5451]))
    def flush(op):
        nonlocal rings,ring
        if ring:rings.append(ring)
        # Attendance areas in these PPS exports are stroked paths. Filled school
        # symbols can inherit a boundary color; they are not catchment geometry.
        if is_boundary() and op in ('S','s'):
            for r in rings:
                if len(r)<4 or math.dist(r[0],r[-1])>1:continue
                if r[-1]!=r[0]:r.append(r[0])
                if not all(bbox[0]-1<=p[0]<=bbox[2]+1 and bbox[1]-1<=p[1]<=bbox[3]+1 for p in r):continue
                area=abs(sum(r[i][0]*r[i+1][1]-r[i+1][0]*r[i][1] for i in range(len(r)-1)))/2
                if area<100:continue
                features.append({'type':'Feature','properties':{'boundary_id':f'{path.stem}-{len(features)+1}','school_name':None,'review_status':'unverified','source_paint':op},'geometry':{'type':'Polygon','coordinates':[[geo(p) for p in r]]}})
        rings=[];ring=[]
    for line in s.splitlines():
        parts=line.split()
        if not parts:continue
        op=parts[-1]
        if op=='SCN':stroke=list(map(float,parts[:-1]))
        elif op=='cm':ctm=multiply(ctm,list(map(float,parts[:6])))
        elif op=='q':stack.append((ctm[:],stroke[:]))
        elif op=='Q':ctm,stroke=stack.pop()
        elif op=='BDC':
            name=next((x[1:] for x in parts if x.startswith('/Layer_')),None);marked.append(layers.get(name,''))
        elif op=='BMC':marked.append('')
        elif op=='EMC':
            if marked:marked.pop()
        elif op=='m':
            if ring:rings.append(ring)
            ring=[transform(ctm,list(map(float,parts[:2])))]
        elif op=='l':ring.append(transform(ctm,list(map(float,parts[:2]))))
        elif op=='h':
            if ring and ring[-1]!=ring[0]:ring.append(ring[0][:])
        elif op in ('S','s','B','B*','f','f*','n'):flush(op)
        elif op in ('c','v','y') and ring:
            ns=list(map(float,parts[:-1]));pts=[transform(ctm,ns[j:j+2]) for j in range(0,len(ns),2)]
            p0=ring[-1];p1,p2,p3=pts if op=='c' else ([p0,*pts] if op=='v' else [pts[0],pts[1],pts[1]])
            for j in range(1,17):
                t=j/16;ring.append([(1-t)**3*p0[k]+3*(1-t)**2*t*p1[k]+3*(1-t)*t*t*p2[k]+t**3*p3[k] for k in range(2)])
    return {'type':'FeatureCollection','features':features,'metadata':{'source_pdf':path.name,'georef_source':georef_source,'sha256':hashlib.sha256(b).hexdigest(),'pdf_viewport':bbox,'control_points':gpts,'status':'provisional','notes':'Vector subpaths extracted from main viewport. Names, topology, inset coverage and positional accuracy require review. Not enabled for assignments.'}}

if __name__=='__main__':
    root=Path(sys.argv[1]);out=Path(__file__).resolve().parent.parent/'public/data';out.mkdir(exist_ok=True);manifest=[]
    for level in ['elementary','middle','high']:
        for scenario in ['current','a','b']:
            p=root/f'{scenario}-{level}.pdf';fc=extract(p);dest=out/f'{p.stem}.geojson';dest.write_text(json.dumps(fc,separators=(',',':')));print(p.stem,len(fc['features']))
            manifest.append({'id':p.stem,'level':level,'scenario':scenario,'url':f'/data/{dest.name}','features':len(fc['features']),'reviewed':False,'source_pdf':f'/maps/{p.name}'})
    (out/'manifest.json').write_text(json.dumps(manifest,indent=2))
