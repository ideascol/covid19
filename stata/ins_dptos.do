/*************************************
*Created: 04/23/2020
*Last Modified: 04/23/2020
*Purpose: 		
	- Clean dataset from INS 
	- Obtain number of confirmed cases and deaths by departmento
*Author: Lina Ramirez and Juan Camilo Chaves 
*Created files: 


*Requirements: STATA 13. 	
	
*************************************/


*Setting paths 

if c(username) == "linar" {
	gl path "C:\Users/`c(username)'\Dropbox\Personal-Projects\Covid-Colombia"
	gl do "C:\Users/`c(username)'\Desktop\GitHub\covid19\stata"
	

}
else { 
	
	
}

gl data "$path\data"
gl raw "$path\ins_raw"
gl mod "$path\ins_mod"

cd ${raw}
