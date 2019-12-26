# Remove old zip if it exists
rm lambda.zip

# Make new zip file
cd lambda
zip -r ../lambda.zip ./*
cd ..

# Upload to AWS
aws lambda update-function-code --function-name tu-berlin-isis-course-crawler-event-tracker --zip-file fileb://lambda.zip

# Delete zip
rm lambda.zip