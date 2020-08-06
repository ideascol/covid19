/* -----------------------------------------------------------------------------
PROJECT: COVID 19 IN COLOMBIA 
TOPIC: Master file
AUTHOR: Lina M. Ramirez 
DATE: 08/05/2020

NOTES: 
	- Master do-file. 
	

------------------------------------------------------------------------------*/

clear all 


*-------------------------------------------------------------------------------
*							0- Setting paths
*
*-------------------------------------------------------------------------------

if c(os)=="Windows" {
	cd "C:/Users/`c(username)'/Dropbox"
	
}
else if c(os)=="MacOSX" {
	cd "/Users/`c(username)'/Dropbox"
	
}

global dropbox `c(pwd)'

if "`c(username)'"=="bfiuser" {
	gl path "$dropbox/Chicago/UChicago/Personal/CHECC"
	gl child "$path/child health assessment"
	gl parents "$path/parent health assessment"
	gl childparent "$path/parent_child health linked"
}

else if "`c(username)'"=="linar" { 
	gl path "$dropbox/Personal-Projects/Covid-Colombia""
	gl data "$path/data"
	gl raw "$data/ins_raw"
	gl mod "$data/ins_mod"
	gl migpat "$dropbox/Personal-Projects/Migration-patterns-covid-19/data"
	
}



