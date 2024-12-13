import { PassThrough } from "stream";

import type { UploadHandler } from "@remix-run/node";
import { writeAsyncIterableToWritable } from "@remix-run/node";
import AWS from "aws-sdk";

const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_BUCKET_NAME } =
  process.env;

if (
  !(AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY && AWS_REGION && AWS_BUCKET_NAME)
) {
  throw new Error(`Storage is missing required configuration.`);
}

const uploadStream = ({ Key }: Pick<AWS.S3.Types.PutObjectRequest, "Key">) => {
  const s3 = new AWS.S3({
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
    region: AWS_REGION,
  });
  const pass = new PassThrough();
  return {
    writeStream: pass,
    promise: s3.upload({ Bucket: AWS_BUCKET_NAME, Key, Body: pass }).promise(),
  };
};

export async function uploadStreamToS3(data: any, filename: string) {
  const stream = uploadStream({
    Key: filename,
  });
  await writeAsyncIterableToWritable(data, stream.writeStream);
  const file = await stream.promise;
  return file.Location;
}

export const s3UploadHandler: UploadHandler = async ({
  name,
  filename,
  data,
}) => {
  if (name !== "file") {
    return undefined;
  }
  const uploadedFileLocation = await uploadStreamToS3(data, filename!);
  return uploadedFileLocation;
};