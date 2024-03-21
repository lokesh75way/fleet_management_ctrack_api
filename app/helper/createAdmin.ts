import dotenv from "dotenv";
import User, { UserRole, UserType } from "../schema/User";
import { initDB } from "../services/initDB";

dotenv.config();
initDB();

export const createAdmin = async () => {
    const email = process.env.ADMIN_EMAIL;
    const admin = await User.findOne({ email: email });
    if(!admin) {
        const save = await User.create({
            email: email,
            role: UserRole.SUPER_ADMIN,
            type: UserType.ADMIN,
            password: "Admin@123",
            userName: "superadmin",
            firstName: "Super",
            lastName: "Admin",
            mobileNumber: "9000000000"
        });
        if(!save){
            console.log(`Error while creating admin!`);
            process.exit();
        } else {
            console.log(`Admin created successfilly!`);
            process.exit();
        }
    } else {
        console.log(`Admin already created!`);
        process.exit();
    }
}

createAdmin();