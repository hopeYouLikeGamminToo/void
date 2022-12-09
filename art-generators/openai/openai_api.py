# https://beta.openai.com/docs/libraries
# to use this script: `pip install openai`
# view account api keys: https://beta.openai.com/account/api-keys

import os
import openai
import math
from PIL import Image


# Load your API key from an environment variable or secret management service
openai.api_key = os.getenv("OPENAI_API_KEY")

# response = openai.Completion.create(model="text-davinci-003", prompt="Say this is a test", temperature=0, max_tokens=7)
# print("response: ", response)


# load and resize image
# path = "../images/input/"
# img_name = "glonky-headshot"

# img = Image.open(f"{path}{img_name}.png")

# # Input must be equal width & height > Generated images can have a size of 256x256, 512x512, or 1024x1024 pixels
# input_img = img.resize((256, 256))

# # Save the resized image
# input_img.save(f"{path}{img_name}_256x256.png")


# edit masked area
# response = openai.Image.create_edit(
#   image=open(f"{path}{img_name}_256x256.png", "rb"),
#   mask=open(f"{path}{img_name}-transparent_256x256.png", "rb"),
#   prompt="A mug shot of glonky, a turtle, background is a forest",
#   n=3,
#   size="256x256"
# )

# image variation
# response = openai.Image.create_variation(
#   image=open(f"{path}{img_name}_256x256.png", "rb"),
#   n=3,
#   size="256x256"
# )

# text to image
response = openai.Image.create(
  prompt="a drawing for a 2D video game of a character named, mr. glonky, a panda bear, running through a forest with a weapon in his hand",
  n=3,
  size="512x512"
)


print("response: ", response, "\n")
