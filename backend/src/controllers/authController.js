import bcrypt from "bcryptjs";
import User from "../models/user.js";
import UserRole from "../models/userRole.js";
import Profile from "../models/profile.js";

const updateProfile = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      console.error(`User not found: ${userId}`);
      return;
    }
    
    const userName = `${user.firstName} ${user.lastName}`.trim();
    
    await Profile.findOneAndUpdate(
      { user: userId },
      { 
        userName,
        $setOnInsert: {
          bio: '',
          about: '',
          skills: [],
          experience: [],
          education: [],
          awards: []
        }
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error(`Error updating profile for user ${userId}:`, error);
  }
};

export const signIn = async (req, res) => {
    console.log(`Authenticated User : ${req.user}`);
    res.status(200).json({ 
        success: true,
        message: "Login Successful", 
        user: req.user 
    });
};


// Password validation function
const isPasswordValid = (password) => {
    return password.length >= 6 &&
           /[A-Z]/.test(password) &&
           /[a-z]/.test(password) &&
           /[!@#$%^&*(),.?":{}|<>]/.test(password);
};

export const signUp = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password } = req.body;
        
        // Validate password
        if (!password) {
            return res.status(400).json({ 
                message: "Password is required" 
            });
        }
        
        if (!isPasswordValid(password)) {
            return res.status(400).json({ 
                message: "Password must be at least 6 characters long and contain at least 1 uppercase letter, 1 lowercase letter, and 1 special character" 
            });
        }
        
        const existingUser = await User.findOne({ $or: [{ email }, { mobileNo: phone }] });

        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        const hashedPass = await bcrypt.hash(password, 10);
        const newUser = new User({
            firstName,
            lastName,
            email,
            mobileNo: phone,
            password: hashedPass,
        });

        await newUser.save();
        console.log(`New User Created: ${newUser}`);z

        //log in the user after registration
        req.login(newUser, (err) => {
            if (err) {
                console.error("Auto-login after registration failed:", err);
                return res.status(201).json({
                    success: true,
                    message: "Registration successful! Welcome to Voxvertex!",
                    user: newUser
                }); // Still return success but without session
            }

            return res.status(201).json({
                success: true,
                message: "Registration successful! Welcome to Voxvertex!",
                user: newUser
            });
        });

    } catch (error) {
        res.status(500).json({
            error: "Error While Registering User",
            message: error.message
        });
    }
};

export const checkAuthStatus = async (req, res) => {
    if (req.user) {
        res.status(200).json({ message: "User Is Logged In", user: req.user });
    } else {
        res.status(401).json({ message: "User Is Not Logged In" });
    }
};   

export const logOut = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized User!" });
    }

    req.logOut((err) => {
        if (err) {
            return res.status(400).json({ message: "Session Expired!" });
        }
        return res.status(200).json({ message: "Logout Successful" });
    });
};


export const forgetPass = async () => {
    //logic here
};

export const setExpertDetails = async (req, res) => {
    try {
        const { workEmail, industry, subField, mobileNo, urlField } = req.body;

        if(!workEmail) {
            return res.status(400).json({ message: "Work email is required" });
        }

        const existingUser = await User.findOne({ mobileNo: mobileNo });
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update user role
        existingUser.role = "Expert";
        await existingUser.save();

        const existingMobileNo = await UserRole.findOne({ mobileNo });
        if (existingMobileNo) {
            return res.status(400).json({
                message: "Mobile number already in use by another role",
                existingRole: existingMobileNo.role
            });
        }

        const existingUserRole = await UserRole.findOne({
            userId: existingUser._id,
            role: "Expert"
        });

        if (existingUserRole) {
            return res.status(400).json({ message: "Expert role already assigned" });
        }

        const newUserRole = new UserRole({
            userId: existingUser._id,
            workEmail,
            role: "Expert",
            industry,
            subField,
            mobileNo,
            urlField: urlField || []
        });

        await newUserRole.save();
        await updateProfile(existingUser._id);

        existingUser.signupComplete = true;
        await existingUser.save();

        return res.status(201).json({
            message: "Expert role assigned successfully",
            data: { user: existingUser, userRole: newUserRole }
        });
    } catch (error) {
        console.error("Error in setExpertDetails:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const setOrganizerDetails = async (req, res) => {
    try {
        const { industry, subField, mobileNo, urlField, role, workEmail } = req.body;
        const existingUser = await User.findOne({ mobileNo: mobileNo });
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update user role
        existingUser.role = role;
        await existingUser.save();

        const existingMobileNo = await UserRole.findOne({ mobileNo });
        if (existingMobileNo) {
            return res.status(400).json({
                message: "Mobile number already in use by another role",
                existingRole: existingMobileNo.role
            });
        }

        if (role != "Business" && role != "Freelancer") {
            return res.status(400).json({ message: "Invalid Role" });
        }

        if (role === "Business" && !workEmail) {
            return res.status(400).json({ message: "Work email is required for Business role" });
        }

        const existingUserRole = await UserRole.findOne({
            userId: existingUser._id,
            role: role
        });

        if (existingUserRole) {
            return res.status(400).json({ message: "Organizer role already assigned" });
        }

        const newUserRole = new UserRole({
            userId: existingUser._id,
            workEmail: role === "Business" ? workEmail : existingUser.email,
            role,
            industry,
            subField,
            mobileNo,
            urlField: urlField || []
        });

        await newUserRole.save();
        await updateProfile(existingUser._id);

        existingUser.signupComplete = true;
        await existingUser.save();

        return res.status(201).json({
            message: "Organizer role assigned successfully",
            data: { user: existingUser, userRole: newUserRole }
        });
    } catch (error) {
        console.error("Error in setOrganizeDetails:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const setParticipantDetails = async (req, res) => {
    try {
        const { industry, subField, mobileNo } = req.body;
        const existingUser = await User.findOne({ mobileNo: mobileNo });

        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update user role
        existingUser.role = "Participant";
        await existingUser.save();

        const existingMobileNo = await UserRole.findOne({ mobileNo });
        if (existingMobileNo) {
            return res.status(400).json({
                message: "Mobile number already in use by another role",
                existingRole: existingMobileNo.role
            });
        }

        const existingUserRole = await UserRole.findOne({
            userId: existingUser._id,
            role: "Participant"
        });

        if (existingUserRole) {
            return res.status(400).json({ message: "Participant role already assigned" });
        }

        const newUserRole = new UserRole({
            userId: existingUser._id,
            workEmail: existingUser.email,
            role: "Participant",
            industry,
            subField,
            mobileNo
        });

        await newUserRole.save();
        await updateProfile(existingUser._id);

        existingUser.signupComplete = true;
        await existingUser.save();
        
        return res.status(201).json({
            message: "Participant role assigned successfully",
            data: { user: existingUser, userRole: newUserRole }
        });
    } catch (error) {
        console.error("Error in setParticipantDetails:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


let otpStore = {};
export const verifyEmail = async (req, res) => {
    const { workEmail, otp } = req.body;

    if (!workEmail) return res.status(400).json({ message: "Email is required" });

    const workEmailRegex = /^[a-zA-Z0-9._%+-]+@(gmail|outlook|yahoo)\.com$/;
    if (workEmailRegex.test(workEmail)) {
        return res.status(400).json({ message: "Invalid Work Email" });
    }

    const blockedDomains = ["outlook.com", "yahoo.com", "gmail.com"];
    const domain = workEmail.split("@")[1];

    if (blockedDomains.includes(domain)) {
        return res.status(400).json({ message: "Invalid work email domain" });
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: "nalin.krishali001@gmail.com",
            pass: "ldwo nrto atfl bvux",
        }
    });

    if (!otp) {
        const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore[workEmail] = { otp: newOTP, expiresAt: Date.now() + 5 * 60 * 1000 };

        await transporter.sendMail({
            from: "nalin.krishali001@gmail.com",
            to: workEmail,
            subject: "Verification email from Voxvertex",
            text: `Your OTP is ${newOTP}. It expires in 5 minutes.`,
        });

        return res.json({ message: "OTP sent successfully" });
    }

    const storedOTP = otpStore[workEmail];
    if (!storedOTP) return res.status(400).json({ message: "OTP not found or expired" });

    if (Date.now() > storedOTP.expiresAt) {
        delete otpStore[workEmail];
        return res.status(400).json({ message: "OTP expired" });
    }

    if (storedOTP.otp !== otp) {
        return res.status(400).json({ message: "Invalid OTP" });
    }

    delete otpStore[workEmail];
    res.json({ message: "OTP verified successfully", verified: true });
}

export const getSignupStatus = async (req, res) => {
    const { email } = req.query;

    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
        signupComplete: user.signupComplete
    });
};



// export const setExpertDetails = async (req, res) => {
//     try {
//         const { userId, workEmail, role, industry, subField } = req.body;

//         const existingUser = await User.findById(userId);
//         if (!existingUser) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         const existingRole = await UserRole.findById(userId);
//         if (existingRole) {
//             return res.status(409).json({ message: "User role already defined !" });
//         }

//         if (!workEmail || workEmail.trim() === "") {
//             return res.status(400).json({ message: "Work email is required" });
//         }

//         existingRole.workEmail = workEmail;

//         const organisationIdImage = req.file
//             ? {
//                 data: req.file.buffer,
//                 contentType: req.file.mimetype,
//             }
//             : undefined;

//         const verificationToken = crypto.randomBytes(32).toString("hex");

//         await transporter.sendMail({
//             from: "VoxVertex <yourgmail@gmail.com>",
//             to: workEmail,
//             subject: "Verify Your Work Email",
//             html: `<p>Hello ${existingUser.firstName},</p>
//                    <p>Please verify your work email by clicking the link below:</p>
//                    <a href="${verificationLink}">Verify Email</a>`
//         });
//         res.status(200).json({ message: "Verification email sent!" });
//     } catch (error) {
//         res.status(500).json({ message: "Error while setting expert details", error: error.message });
//     }
// }

// export const verifyWorkEmail = async (req, res) => {
//     try {
//         const { token, userId } = req.query;

//         const role = await UserRole.findOne({ userId, emailVerificationToken: token });
//         if (!role) return res.status(400).json({ message: "Invalid or expired token" });

//         role.isVerified = true;
//         role.emailVerificationToken = undefined;
//         await role.save();

//         res.status(200).json({ message: "Work email verified successfully!" });
//     } catch (err) {
//         res.status(500).json({ message: "Verification failed", error: err.message });
//     }
// };

export const testUser = async (req, res) => {
    const user = await User.findOne({ email: "ronish.sheoran@voxvertexsoultions.com" });
    res.json(user ?? { messsage: "User not found" });
}
   