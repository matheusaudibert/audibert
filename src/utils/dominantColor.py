import sys
from PIL import Image
import requests
from io import BytesIO
import numpy as np
from collections import Counter

def get_dominant_color(image_url):
  
    response = requests.get(image_url)
    img = Image.open(BytesIO(response.content))

    if img.format == 'GIF':
        img = img.convert('RGBA') 
        img = img.convert("RGB")  
        img.seek(0)  

    if img.mode == 'RGBA':
        img = img.convert('RGB')

    img = img.resize((img.width // 5, img.height // 5)) 

    pixels = np.array(img)
    pixels = pixels.reshape(-1, 3) 
    
    counter = Counter(map(tuple, pixels))
    dominant_color = counter.most_common(1)[0][0]

    return '#{:02x}{:02x}{:02x}'.format(dominant_color[0], dominant_color[1], dominant_color[2])

if __name__ == "__main__":
    image_url = sys.argv[1]
    color = get_dominant_color(image_url)
    print(color)
