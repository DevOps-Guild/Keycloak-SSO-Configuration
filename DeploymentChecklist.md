It is very intuitive to write a prompt to ai and just copy paste, but i ran through all these steps on my own and confirmed it does work

# 1. Open the EC2 dashboard
1. click the 3 lined icon in the top left
2. Selevt all services
3. Look under the "Compute" category
4. choose "EC2"

## 1.2. Launch An Instance
1. look on the right side, there should be an orange button written "Launch instance"
2. Name your instance e.g. : "Karaboisthebest"
3. Choose an amazon machine, i'll use : "ubuntu"
4. Choose an instance type i'll use :"T3-micro"
5. Click "create new key pair"
6. Enter a key pair name, i'll use "chandrax"
7. select "RSA" and ".pem"

    >Note: keep the downloaded file safe, you wont be allowed to download it again

8. Check "Allow SSH traffic from" and leave it as "anywhere"
9. Check Allow HTTP traffic from the internet (automatocially Port 80).
10.Check Allow HTTPS traffic from the internet (auto automatically Port 443).    
    >The ports above are for the demo but if you wish to set it to a custom port like how keycloak likes to use 8080 then go to 1.2.3

11. Click "launch instance"
12. click on "view all instances" at the bottom of the page
13. make sure the instance "Karaboisthebest" says "running"

### 1.2.3 Changing The ports(optional)
1. scroll to the network settings
2. make sure "Create security group" is selected
3. click edit on the top right corner of network settings
4. scroll down to the botom click "add security group rule"
5. Set Type to Custom TCP,
6. Set Port Range to 8080,
7. Source type to Anywhere-IPv4 (0.0.0.0/0).
    
# 2. SSH access rules
1. Open your local terminal (powershell, bash, cmd i'll use the linux one) to where the .pem key is located
    >cd /path/to/your/key/

2. set permissions for your key file

    >chmod 400 chandrax.pem

3. Connect to the instance using its Public IP address
    
    >ssh -i "chandrax.pem" ubuntu@your-ec2-public-ip

4. This will give you a prompt which you respond to with "yes"
5. My terminal responded with

    >Warning: Permanently added {your ip adress} *** to the list of known hosts.  
    Welcome to Ubuntu 26.04 LTS (GNU/Linux 7.0.0-1006-aws x86_64)
    * Documentation:  https://docs.ubuntu.com
    * Management:     https://landscape.canonical.com
    * Support:        https://ubuntu.com/pro

    System information as of Sat Jul 11 07:32:44 UTC 2026

    System load:  0.0               Temperature:           -273.1 C
    Usage of /:   30.5% of 6.61GB   Processes:             116
    Memory usage: 25%               Users logged in:       0
    Swap usage:   0%                IPv4 address for ens5: ***{lol not sharing that}***

    Expanded Security Maintenance for Applications is not enabled.

    0 updates can be applied immediately.

    Enable ESM Apps to receive additional future security updates.
    See https://ubuntu.com/esm or run: sudo pro status

    The list of available updates is more than a week old.
    To check for new updates run: sudo apt update

    The programs included with the Ubuntu system are free software;
    the exact distribution terms for each program are described in the
    individual files in /usr/share/doc/*/copyright.

    Ubuntu comes with ABSOLUTELY NO WARRANTY, to the extent permitted by applicable law.

# 3. Docker on server
## 3.0 Incase of frozen terminal
1. I experienced having a frozen terminal because i took a break between 2.5 and step 3
2. If that's you too use the shortcut: (ENTER) + (~.)
    >This will stop the server

3. Then press the up-arrow key on your keyboard to go to previous commands
4. Then restart your server and continue

## 3.1 Install docker on the  EC2 instance
1. update the unbuntu server
    >sudo apt-get update -y
    >sudo apt-get upgrade -y

2. Install docker on the server
    >sudo apt-get install docker.io -y
3. verify installation
    >docker --version

## 3.2 Configure docker to autostart on server boot-up
1. To make sure docker starts the moment the server starts:
    >sudo systemctl start docker
    
    >sudo systemctl enable docker

2. So you don't have to type sudo before every docker command:
    >sudo usermod -aG docker ubuntu

3. Apply the changes immediately{otherwise you'll have to restart the server for your changes to apply}
    >newgrp docker
    
# 4.Environment Variable Setup
Run these steps in the server not locally
1. let's make a directory and move into it{for organization}
    >mkdir app  
    cd app

2. let's make an env file
    >nano .env

3. Paste your variables in there {below are just placeholders}
    >NODE_ENV=production  
    PORT=8080   
    DATABASE_URL=your_database_connection_string  
    API_KEY=your_secret_api_key

4. Save and exit the tect editor, do the keyboard shortcuts below
    >press: Ctrl + O {the letter not the number}  
    press: Enter {the button}  
    press: Ctrl + X

# 5. Start the the docker Container on the server
1. Run the below command with placeholders
    >docker run -d --name my-running-app -p 80:8080 --env-file .env --restart always your-dockerhub-username/your-app-image:latest
    
## 5.2 Docker Run Command Placeholder Guide
    To avoid confusion the placeholders for the above command are:

| Placeholder | Component to Replace | What to Replace It With | Example Value |
| :--- | :--- | :--- | :--- |
| **PLACEHOLDER_1** | `--name my-running-app` | A custom nickname to identify this container on your server. | `--name cms-admin-panel` |
| **PLACEHOLDER_2** | The target port in `-p 80:8080` | The internal port your application code is configured to listen on. | `3000` (making it `-p 80:3000`) |
| **PLACEHOLDER_3** | `your-dockerhub-username/...` | The complete, official registry URI to your team's container image. | `123456789012.dkr.ecr.us-east-1.amazonaws.com/docker_starter:latest` |

# 6. Check the status of the container
1. to check if the container is running use either of:
    >docker ps  
    //this shows a list of containers currently running

    >docker ps -a  
    //this shows a list of all non-deleted previously opened containers running or stopped

2. to see the logs of the container:
    >docker logs --tail 50 -f web-app-container

3. Test the app locally from inside the server
    >curl http://localhost:80  
    //This will not run locally on your machine coz this command went to the server, making the server to be the local host  
    //If it's working it'll give back html or json response

4. Test outside the server, on your browser
    >http://YOUR_EC2_PUBLIC_IP

    
# 7. When you're done
## 7.1 My costly mistake
Simply closing your local terminal window DOES NOT stop the AWS server. 
It continues running in the background cloud and you will keep getting billed!
## 7.2 How to properly close it
1. Go to the aws console in your browser
2. Navigate to EC2
3. Check the box next to your instance name
    >Karaboisthebest

4. Click on the "Instance state" drop down menu
    >Horizontally Inline with the "launch instances button"

5. Click on "Stop Instance"
6. Or if you want to go nuclear click "Terminate(delete)Instance"