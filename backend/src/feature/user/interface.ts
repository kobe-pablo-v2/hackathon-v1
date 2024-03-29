import { User, UserCrate, UserWithHashedPassword } from "./entity";

export interface UserRepository {
	findByID(id: number): Promise<User | undefined>;
	findByName(name: string): Promise<UserWithHashedPassword | undefined>;
	crate(userCreate: UserCrate): Promise<User>;
	delete(userID: number): Promise<void>;
	list(): Promise<User[]>;
}
