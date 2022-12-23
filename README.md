This is a basic Rest Api CRUD application where you can find 3 different types of users:
-Superadmin with roleId: 1 (only 1 user is allowed)
-Admin with roleId: 3
-User with roleId: 5

Permissions
-Superadmin has access to everything
-Admins have access to create/delete users and posts. Update post status
-Users have access to create/delete their own post and only view the others

This project is done by Node Express and Mongodb

Fill the .env.example file with the credentials needed, npm install and start.
