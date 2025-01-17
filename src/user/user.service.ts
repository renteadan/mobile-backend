import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { User } from 'src/user/models/User';
import { UserGateway } from './user.gateway';
import * as crypto from 'crypto';
import { ConfigProvider } from 'src/system/ConfigProvider';
import { sign } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { Token, TokenType } from 'src/user/models/Token';
import validator from 'validator';

@Injectable()
export class UserService {
	constructor(private gateway: UserGateway, private configProvider: ConfigProvider) {
	}

	get secret(): string {
		return this.configProvider.getConfig().SECRET_KEY;
	}

	async findUserByEmail(email: string): Promise<User>  {
		const [result] = await this.gateway.findByUsername(email);
		if (!result) {
			throw new NotFoundException('Invalid username or password');
		}

		return result;
	}

	createHashedPassword(password: string): any {
		const salt = crypto.randomBytes(32).toString('hex');
		const key = crypto.scryptSync(password, salt, 64);
		const newPassword = key.toString('hex');
		return {
			key: newPassword,
			salt,
		};
	}

	hashPassword(salt: string, password: string): string {
		const key = crypto.scryptSync(password, salt, 64);
		return key.toString('hex');
	}

	async registerUser(firstName: string, lastName: string, email: string, password: string): Promise<any> {
		const pass = this.createHashedPassword(password);
		const user: User = {
			first_name: firstName,
			last_name: lastName,
			active: 0,
			email,
			password: pass.key,
			salt: pass.salt,
		};
		//validate email
		await this.validateUser(user);
		const result = await this.gateway.addUserInDB(user);
		const t = uuidv4();
		const token: Token = {
			user_id : result.insertId,
			token : t,
			active : 1,
			type : TokenType.activate,
		};

		await this.gateway.addTokenInDB(token);
		return {
			ok:true,
		};
	}

	async findUserByUsernameAndPassword(email: string, password: string): Promise<User>  {
		const [result] = await this.gateway.findByUsernameAndPassword(email, password);
		if (!result) {
			throw new NotFoundException('Invalid username or password');
		}
		return result;
	}

	async login(email: string, password: string): Promise<string>  {
		// const user = await this.findUserByEmail(email);
		// const pswd = this.hashPassword(user.salt, password);
		const result = await this.findUserByUsernameAndPassword(email, password);
		if (result.active === 0) {
			throw new NotFoundException('You need to activate your account');
		}
		return this.getUserToken(result);
	}

	getUserToken(user: User): string {
		return sign({
			userId : user.id,
		}, this.secret);
	}

	async findUserById(id: number): Promise<User>  {
		const [result] = await this.gateway.findById(id);
		if (!result) {
			throw new NotFoundException('Invalid id!');
		}

		return result;
	}
	async findTokenById(token: string): Promise<Token> {
		const [result] = await await this.gateway.findResetToken(token);
		if (!result) {
			throw new NotFoundException('Active rest token not found!');
		}

		return result;
	}

	async validateUser(user: User): Promise<void> {
		const [result] = await this.gateway.findByUsername(user.email);
		if (result) {
			throw new UnprocessableEntityException('There is already an account with this email');
		}
		if (user.first_name === '') {
			throw new UnprocessableEntityException('First name is empty!');
		}
		if (user.last_name === '') {
			throw new UnprocessableEntityException('Last name is empty!');
		}
		if (user.password === '') {
			throw new UnprocessableEntityException('Password name is empty!');
		}
		if (user.email === '') {
			throw new UnprocessableEntityException('Email is empty!');
		}
		if (!validator.isEmail(user.email)) {
			throw new UnprocessableEntityException('Bad email format!');
		}
	}

	async updatePassword(token: string, password: string): Promise<any> {
		const t = await this.findTokenById(token);
		const pass = this.createHashedPassword(password);
		const updatedUser: User = {
			password: pass.key,
			salt: pass.salt,
		};
		const updatedToken: Token = {
			active: 0,
		};
		await this.gateway.updateToken(updatedToken,t.id);
		await this.gateway.updateUser(updatedUser,t.user_id);

		return {
			ok:true,
		};
	}
	async resetPasswd(email: string): Promise<any> {
		const t = uuidv4();
		const user = await this.findUserByEmail(email);

		const token: Token = {
			user_id: user.id,
			token: t,
			active: 1,
			type: TokenType.reset,
		};
		await this.gateway.addTokenInDB(token);

		return {
			ok:true,
		};
	}

	async activateUser(identifier: string): Promise<any> {
		const [result] = await this.gateway.findTokenByToken(identifier);
		if (!result) {
			throw new NotFoundException('Invalid token');
		}

		if (result.active === 0) {
			throw new NotFoundException('Token already used');
		}

		if (result.type !== TokenType.activate) {
			throw new NotFoundException('Invalid token');
		}

		const token: Token = {
			active: 0,
		};
		await this.gateway.updateToken(token, result.id);
		await this.gateway.updateUserActivation(result.user_id);
		return {
			ok: true,
		};
	}
}

