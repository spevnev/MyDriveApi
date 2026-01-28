import {Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {sign, verify} from "jsonwebtoken";

const EXPIRES_AFTER = 24 * 60 * 60; // 1 day

@Injectable()
export class TokenService {
	private readonly privateKey: string;
	
	constructor(configService: ConfigService) {
		this.privateKey = configService.get("JWT_PRIVATE_KEY")
	}
	
	generateJWT(data: object): Promise<string> {
		return new Promise((resolve, reject) => {
			const exp: number = Math.floor(Date.now() / 1000) + EXPIRES_AFTER;

			sign({...data, exp}, this.privateKey, {}, (err, token) => {
				if (err || !token) reject(err);
				resolve(`Bearer ${token}`);
			});
		});
	}

	verifyJWT(jwt: string): Promise<null | { [key: string]: any }> {
		return new Promise(resolve => {
			verify(jwt, this.privateKey, (err, value) => {
				if (err) console.log(err);
				resolve(value as object);
			});
		});
	}
}