import Permission from "../schema/Permission";
import { UserRole } from "../schema/User";

export const getTemplate = async (role: any) => {
  let templateName;
  if (role === UserRole.SUPER_ADMIN) {
    templateName = process.env.ADMIN_TEMPLATE;
  } else if (role === UserRole.BUSINESS_GROUP) {
    templateName = process.env.GROUP_TEMPLATE;
  } else if (role === UserRole.COMPANY) {
    templateName = process.env.COMPANY_TEMPLATE;
  }

  let template = await Permission.find({ name: templateName }).populate(
    "permission.moduleId"
  );
  if (template) {
    return template;
  }
  const newTemplate = await Permission.create({
    name: templateName,
    permission: [
      {
        moduleId: "6603f2224e8c3ab91b08b6c1",
        add: true,
        view: true,
        modify: true,
        delete: true,
      },
      {
        moduleId: "6603f3819503ccb8d70f3fc9",
        add: role === UserRole.SUPER_ADMIN ? true : false,
        view: role === UserRole.SUPER_ADMIN ? true : false,
        modify: role === UserRole.SUPER_ADMIN ? true : false,
        delete: role === UserRole.SUPER_ADMIN ? true : false,
      },
      {
        moduleId: "6603f3929503ccb8d70f3fcc",
        add:
          role === UserRole.SUPER_ADMIN || role === UserRole.BUSINESS_GROUP
            ? true
            : false,
        view:
          role === UserRole.SUPER_ADMIN || role === UserRole.BUSINESS_GROUP
            ? true
            : false,
        modify:
          role === UserRole.SUPER_ADMIN || role === UserRole.BUSINESS_GROUP
            ? true
            : false,
        delete:
          role === UserRole.SUPER_ADMIN || role === UserRole.BUSINESS_GROUP
            ? true
            : false,
      },
      {
        moduleId: "6603f39f9503ccb8d70f3fcf",
        add: true,
        view: true,
        modify: true,
        delete: true,
      },
      {
        moduleId: "6603f3ab9503ccb8d70f3fd2",
        add: true,
        view: true,
        modify: true,
        delete: true,
      },
      {
        moduleId: "6603f3b99503ccb8d70f3fd5",
        add: true,
        view: true,
        modify: true,
        delete: true,
      },
      {
        moduleId: "6603f4879503ccb8d70f4056",
        add: true,
        view: true,
        modify: true,
        delete: true,
      },
      {
        moduleId: "6603f4979503ccb8d70f4059",
        add: true,
        view: true,
        modify: true,
        delete: true,
      },
      {
        moduleId: "6603f3d09503ccb8d70f3fd8",
        add: true,
        view: true,
        modify: true,
        delete: true,
      },
      {
        moduleId: "6603f3de9503ccb8d70f3fdb",
        add: true,
        view: true,
        modify: true,
        delete: true,
      },
      {
        moduleId: "6603f3f59503ccb8d70f3fde",
        add: true,
        view: true,
        modify: true,
        delete: true,
      },
      {
        moduleId: "6603f4119503ccb8d70f4029",
        add: true,
        view: true,
        modify: true,
        delete: true,
      },
      {
        moduleId: "6603f4259503ccb8d70f4050",
        add: true,
        view: true,
        modify: true,
        delete: true,
      },
      {
        moduleId: "6603f4cb9503ccb8d70f4080",
        add: true,
        view: true,
        modify: true,
        delete: true,
      },
      {
        moduleId: "6603f4d69503ccb8d70f408f",
        add: true,
        view: true,
        modify: true,
        delete: true,
      },
      {
        moduleId: "6603f4e19503ccb8d70f40aa",
        add: true,
        view: true,
        modify: true,
        delete: true,
      },
      {
        moduleId: "6603f4f19503ccb8d70f40ad",
        add: true,
        view: true,
        modify: true,
        delete: true,
      },
      {
        moduleId: "6603f4349503ccb8d70f4053",
        add: true,
        view: true,
        modify: true,
        delete: true,
      },
      {
        moduleId: "6603f51c9503ccb8d70f40c8",
        add: true,
        view: true,
        modify: true,
        delete: true,
      },
      {
        moduleId: "6603f52c9503ccb8d70f40cb",
        add: true,
        view: true,
        modify: true,
        delete: true,
      },
      {
        moduleId: "6603f53c9503ccb8d70f40ce",
        add: true,
        view: true,
        modify: true,
        delete: true,
      },
      {
        moduleId: "6603f5509503ccb8d70f40dc",
        add: true,
        view: true,
        modify: true,
        delete: true,
      },
      {
        moduleId: "6603f5649503ccb8d70f40ea",
        add: true,
        view: true,
        modify: true,
        delete: true,
      },
      {
        moduleId: "6603f5759503ccb8d70f40f8",
        add: true,
        view: true,
        modify: true,
        delete: true,
      },
      {
        moduleId: "6603f59c9503ccb8d70f4106",
        add: true,
        view: true,
        modify: true,
        delete: true,
      },
    ],
  });

  template = await Permission.find({ name: templateName }).populate(
    "permission.moduleId"
  );
  if (template) {
    return template;
  }

  return newTemplate;
};
