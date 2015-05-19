# Server installation
#### Install dependencies
To start using archeolofi server on your computer (mostly for development purpose), you will need to install the dependencies listed in `requirements.txt`. A good way to do it, without change your OS python, is to use a virtualenv.
```sh
sudo apt-get install python-virtualenv
# move to the directory where you want to create the environment, then
virtualenv archeolofi
. archeolofi/bin/activate
# move now to the archeolofi server directory
```
Archeolofi uses a postgreSQL database. If you are working on GNU/linux, please install the related needed packages.  
(Note: here I am writing of a specific version of PostgreSQL and psycopg2, which are currently working, but please adjust it to your system)
```
sudo apt-get install python-dev
sudo apt-get install postgresql postgresql-server-dev-9.3
sudp apt-get install python-psycopg2
```
Install now the required dependencies.
```sh
sudo apt-get install python-pip
pip install -r requirements.txt
```
#### Setup the archeolofi database
The quickest way to create the archeolofi database for the first time is doing it manually. You will choose here a database name, an user name and a password.
```sh
sudo -u postgres psql

# now you will see 'postgres=#' at the start of the row
CREATE DATABASE archeolofi;
CREATE USER archeolofi;
\password archeolofi
# chose a password
\q
```
The archeolofi server will need to access the database, you have just created. So, open the file `location.py` and compile the python dictionary at the top.
```python
db = {
	"username" : "archeolofi",
	"password" : "<the password you choosed>",
	"host"     : "localhost",
	"database" : "archeolofi",
}
```
#### Run the server
Ready to go! Now you can launch your local server instance.
```sh
python server.py
```