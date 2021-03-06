
/*************************************
*Created: 04/26/2020
*Last Modified: 05/14/2020
*Purpose: 		
	- Create datasets ready to use on the website 
*Author: Lina Ramirez 
*Created files: 
	-"$ideascol\data_dptos.csv"
	-"$ideascol\data_dptos_trend.csv"

*READ THIS: 
-Daily line 48 has to be modified. 

*Ideas:
Department level
1. Politiko by dpto
2. Daily increase

National level 
1. Daily increase 
*************************************/

*Setting paths 
clear

/*
							Departamento level 
*/

clear 
gl git "/Users/bfiuser/Documents/GitHub/covid19"

gl dpto "$mod/departamentos"
gl nal "$mod/nacional"
gl ideascol "$git/data"




cd ${migpat}

use covid_dptos.dta, clear
*date: aug 30 2020 --> set this day with the last day when both the number of tests and confirmed cases are updated. 
local i=22157


** Politiko - map **
preserve
keep if fecha==`i'
keep fecha departamento codigo pruebas casos_confirmados casos_fallecido 
replace pruebas=0 if pruebas==. 
tostring codigo, replace 
replace codigo="0"+codigo if codigo=="5" | codigo=="8"
sort codigo
export delimited using "$ideascol/data_dptos.csv", replace

restore 


** Politiko - map - por cien mil habitantes **
preserve
keep if fecha==`i'
keep departamento codigo poblacion pruebas casos_confirmados casos_fallecido 
replace pruebas=0 if pruebas==. 
foreach var in pruebas casos_confirmados casos_fallecido {
gen `var'_c=round((`var'*100000)/poblacion, 1)
drop `var'
}
tostring codigo, replace 
replace codigo="0"+codigo if codigo=="5" | codigo=="8"
sort codigo
export delimited using "$ideascol/data_dptos_cienmil.csv", replace

restore 


** Politiko - time series for departamento graph trends **

preserve
keep fecha departamento codigo pruebas casos_confirmados casos_fallecido 
tostring codigo, replace 
replace codigo="0"+codigo if codigo=="5" | codigo=="8"
sort fecha codigo 
export delimited using "$ideascol/data_dptos_trend.csv", replace

restore 


** Active cases / cases in hospitals / beds **
use "$nal/data_nal.dta", clear

preserve 
keep fecha camashospitalizacion camascuidadosintensivos casos_activo casos_hospital casos_hospitaluci casos_recuperado
export delimited using "$ideascol/cases_beds.csv", replace 

restore 




