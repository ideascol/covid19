/*************************************
*Created: 04/26/2020
*Last Modified: 04/29/2020
*Purpose: 		
	- Create datasets ready to use on the website 
*Author: Lina Ramirez 
*Created files: 
	-"$ideascol\data_dptos.csv"
	-"$ideascol\data_dptos_trend.csv"

*READ THIS: 
-Daily line 52 and 57 have to be modified. 

*Ideas:
Department level
1. Politiko by dpto
2. Daily increase

National level 
1. Daily increase 
*************************************/

*Setting paths 
clear all

gl path "C:\Users/linar\Dropbox\Personal-Projects\Covid-Colombia"
gl git "C:\Users/linar\Desktop\GitHub\covid19"

gl do "$git\stata"
gl data "$path\data"
gl raw "$data\ins_raw"
gl mod "$data\ins_mod"
gl dpto "$mod\departamentos"
gl nal "$mod\nacional"
gl ideascol "$git\data"



/*
							Departamento level 
*/


cd ${dpto}

use data_dpto.dta, clear


** Politiko - map **
preserve
*Set day 
local i=29
keep if fecha=="`i'-04-2020"
keep departamento codigo pruebas casos_confirmados casos_fallecido 
replace pruebas=0 if pruebas==. 
tostring codigo, replace 
replace codigo="0"+codigo if codigo=="5" | codigo=="8"
sort codigo
export delimited using "$ideascol\data_dptos.csv", replace

restore 


** Politiko - map - por cien mil habitantes **
preserve
*Set day 
local i=29
keep if fecha=="`i'-04-2020"
keep departamento codigo poblacion pruebas casos_confirmados casos_fallecido 
replace pruebas=0 if pruebas==. 
foreach var in pruebas casos_confirmados casos_fallecido {
gen `var'_c=round((`var'*100000)/poblacion, 1)
drop `var'
}
tostring codigo, replace 
replace codigo="0"+codigo if codigo=="5" | codigo=="8"
sort codigo
export delimited using "$ideascol\data_dptos_cienmil.csv", replace

restore 


** Politiko - time series for departamento graph trends **

preserve
keep fecha departamento codigo pruebas casos_confirmados casos_fallecido 
replace pruebas=0 if pruebas==. 
tostring codigo, replace 
replace codigo="0"+codigo if codigo=="5" | codigo=="8"
sort fecha codigo 
export delimited using "$ideascol\data_dptos_trend.csv", replace

restore 




/*

sort departamento fecha
gen nuevaspruebas=pruebas[_n]-pruebas[_n-1] if departamento[_n]==departamento[_n-1]
gen nuevoscasos=casos_confirmados[_n]-casos_confirmados[_n-1] if departamento[_n]==departamento[_n-1]
gen casos_pruebas=casos_confirmados/pruebas if departamento[_n]==departamento[_n-1]

*/
