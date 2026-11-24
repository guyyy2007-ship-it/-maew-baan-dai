import numpy as np, json
from PIL import Image
im=Image.open('/tmp/claude-0/keyed.png'); A=np.asarray(im).copy()
S=2
chars={'man':dict(x0=225,x1=605,bodycut=224,headcut=250,pivot=(428,232)),
       'woman':dict(x0=610,x1=955,bodycut=280,headcut=306,pivot=(782,290))}
meta={}
for n,c in chars.items():
    crop=A[:, c['x0']*S:c['x1']*S].copy()
    al=crop[...,3]; ys=np.where(al.max(1)>10)[0]; y0=max(ys[0]-10,0)
    crop=crop[y0:]
    H=crop.shape[0]
    yy=np.arange(H)[:,None]+y0
    body=crop.copy(); head=crop.copy()
    bc=c['bodycut']*S; hc=c['headcut']*S
    fb=np.clip((yy-bc)/4,0,1); fh=np.clip((hc-yy)/6,0,1)
    body[...,3]=(body[...,3]*fb).astype(np.uint8)
    head[...,3]=(head[...,3]*fh).astype(np.uint8)
    Image.fromarray(body).save(f'public/chars/{n}-body.png')
    Image.fromarray(head).save(f'public/chars/{n}-head.png')
    Image.fromarray(crop).save(f'/tmp/claude-0/{n}-full.png')
    meta[n]=dict(w=crop.shape[1],h=H,pivotX=c['pivot'][0]*S-c['x0']*S,pivotY=c['pivot'][1]*S-y0,top=y0)
print(json.dumps(meta,default=int))
