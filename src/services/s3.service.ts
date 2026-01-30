import {Injectable} from "@nestjs/common";
import {createPresignedPost, PresignedPostOptions} from "@aws-sdk/s3-presigned-post";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import {GetObjectCommand, PutObjectTaggingCommandInput, S3, S3ClientConfig} from "@aws-sdk/client-s3";
import {PresignedURL} from "../api/file/dto/presignedURL";
import {ConfigService} from "@nestjs/config";

@Injectable()
export class S3Service {
	private readonly client: S3;
	private readonly bucketName: string;

	constructor(configService: ConfigService) {
		const config: S3ClientConfig = {
			credentials: {accessKeyId: configService.get("AWS_API_KEY"), secretAccessKey: configService.get("AWS_SECRET_KEY")},
			region: configService.get("AWS_REGION"),
			apiVersion: "2006-03-01",
		};

		const localstack = configService.get("LOCALSTACK_ENDPOINT");
		if (localstack) {
			config.endpoint = localstack;
			config.forcePathStyle = true;
		}

		this.client = new S3(config);
		this.bucketName = configService.get("AWS_BUCKET_NAME");

		void this.testConnection();
	}

	async testConnection() {
		try {
			await this.client.getObject({Bucket: this.bucketName, Key: "NotExistingKey"});
		} catch (e) {
			if (e.name !== "NoSuchKey") throw new Error("Couldn't connect to AWS S3!");
		}
	}

	async createPresignedPostURL(user_id: number, file_id: number | string, size: number): Promise<PresignedURL | null> {
		const parameters: PresignedPostOptions = {
			Bucket: this.bucketName,
			Key: `${user_id}/${file_id}`,
			Expires: 1800,
			Conditions: [["content-length-range", 0, size]],
		};

		try {
			const {url, fields} = await createPresignedPost(this.client, parameters);

			return {
				url,
				fields: {
					bucket: fields.bucket,
					key: fields.key,
					Policy: fields.Policy,
					Algorithm: fields["X-Amz-Algorithm"],
					Date: fields["X-Amz-Date"],
					Credential: fields["X-Amz-Credential"],
					Signature: fields["X-Amz-Signature"],
				},
			};
		} catch (e) {
			console.log(e);
			return null;
		}
	}

	async createPresignedGet(key: string): Promise<string | null> {
		const parameters = {
			Bucket: this.bucketName,
			Key: key,
		};

		try {
			return await getSignedUrl(this.client, new GetObjectCommand(parameters), {
				expiresIn: 1800,
			});
		} catch (e) {
			console.log(e);
			return null;
		}
	}

	async tagObject(key: string, tag: string, value: string): Promise<boolean> {
		const params: PutObjectTaggingCommandInput = {
			Bucket: this.bucketName,
			Key: key,
			Tagging: {TagSet: [{Key: tag, Value: value}]},
		};

		try {
			await this.client.putObjectTagging(params);
		} catch (e) {
			console.log(e);
			return false;
		}
	}
}
