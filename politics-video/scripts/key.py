import numpy as np
from PIL import Image, ImageFilter
src=Image.open('/root/.claude/uploads/044a4171-4d88-55e6-8704-c786e7fa4301/fdbfb239-image.png').convert('RGB')
src=src.resize((2560,1440),Image.LANCZOS)
a=np.asarray(src).astype(np.float32)
r,g,b=a[...,0],a[...,1],a[...,2]
# greenness: how much green exceeds max(r,b)
d=g-np.maximum(r,b)
alpha=np.clip(1-(d-25)/45,0,1)
# despill
spill=np.clip(g-np.maximum(r,b),0,None)
a2=a.copy(); a2[...,1]=g-spill*np.clip(1-alpha*0.0,0,1)*(d>0)
a2[...,1]=np.minimum(a2[...,1], np.maximum(r,b)+ (g-np.maximum(r,b))*(1-np.clip(d/40,0,1)))
rgba=np.dstack([np.clip(a2,0,255),alpha*255]).astype(np.uint8)
im=Image.fromarray(rgba,'RGBA')
am=im.split()[3].filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
im.putalpha(am)
im.save('/tmp/claude-0/keyed.png')
