import { dbTypes } from "../enums/enums";

const databases = [
  {
    id: 0,
    name: "AWS DynamoDB",
    type: dbTypes.noSQL,
    description:
      "Serverless, NoSQL database with single-digit millisecond performance at any scale",
    imageName: "aws-dynamoDB.svg",
  },
  {
    id: 1,
    name: "Amazon S3",
    type: dbTypes.noSQL,
    description:
      "Object storage built to retrieve any amount of data from anywhere",
    imageName: "bucket.svg",
  },
  {
    id: 2,
    name: "MongoDB Atlas",
    type: dbTypes.noSQL,
    description: "Intuitive document-oriented database",
    imageName: "mongodb.svg",
  },
];
export default databases;
