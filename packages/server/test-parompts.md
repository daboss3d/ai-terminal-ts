# testing end points http://localhost:3001/

# test /prompt with a post 

curl -X POST 'http://localhost:3001/prompts' \
-H "Content-Type: application/json"      -H "Accept: application/json" \
-s -d  '{ "prompt": "Write a poem about a cat" }'


