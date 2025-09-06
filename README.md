# **Sanity** #

Sanity is a headless Content Management System (CMS) that provides structured content storage, real-time collaboration, and API-driven content management. It is used primarily for flexible, scalable, and structured content management across various platforms.

## Sanity Installation & Usage Guide ##
### Requirements ###
* Current NPM version (v10.8.2)
* Current Node Version (v18.20.5)
* WordPress any version will work
* [Sanity WordPress Installation Guide](https://www.sanity.io/learn/course/migrating-content-from-wordpress-to-sanity/introduction-to-wp-migration)

### Setup Instructions ##

#### 1. Clone the Repository: Open your terminal and run ####
```bash
    git clone https://github.com/syraharguilles/migration-sanity
```
#### 2. Install Dependencies ####
```bash
    npm install
```
#### 3. Check Sanity CLI/Config/ENV ####

##### **Prerequisites** #####
###### **In Sanity Online:** ######
- The email to be log-in in [Sanity.io](https://www.sanity.io/login?origin=https%3A%2F%2Fwww.sanity.io%2Fmanage%3Fref%3Dhomepage) should be added member on the project. If not contact Jessie Celestial for invitation.
- The **NP Blog** project should be present to be able to get the **project-id**.
- The dataset should present to be able to get the **dataset-name**.

###### **In Sanity Code:** ######
1. Create a .env file in the root directory
2. Copy the variables that is present in env.sample and paste in created .env file
3. Change the variables that is intended for your setup 
4. [sanit.config.ts](https://bitbucket.org/teamoda/sanity/src/432322249aa4282d35564a70cb2cbc74ba73c401/sanity.config.ts) - The projectID and Dataset should be same with the online.

#### 4. Run the Application ####
```bash
    npm run dev
```
#### 5. Access the Application: Open your browser and navigate to: ####
```bash
    http://localhost:3333/
```

## WordPress / WordPress Import Migration to Sanity ##
- When doing an import from WordPress to Sanity

    - There are two types of imports: 1 is not adding the data in sanity fields and 2 is adding the data in sanity fields.
        - By Adding **--no-dry-run** it will add the data in sanity fields
        - By not adding **--no-dry-run** it will not add the data in sanity fields
    - For Debugging
        - Try adding **> sanity-migration.log 2>&1**

## 1. To bypass SSL verification for all HTTPS requests (⚠ Not secure for production): ##

```bash
    export NODE_TLS_REJECT_UNAUTHORIZED=0  # macOS/Linux
    set NODE_TLS_REJECT_UNAUTHORIZED=0     # Windows (CMD)
    $env:NODE_TLS_REJECT_UNAUTHORIZED="0"  # Windows (PowerShell)
```

## 2. Import command from WordPress to Sanity ##

```bash
npx sanity@latest migration run import-wp --type=<Change this to actual Post Type> --no-dry-run > sanity-migration.log 2>&1
```

## DEMO ##

https://vimeo.com/1116345004
