/*************************************
*Created: 04/23/2020
*Last Modified: 04/24/2020
*Purpose: 		
	- Clean dataset from INS 
	- Obtain number of confirmed cases and deaths by departmento
*Author: Lina Ramirez 
*Created files: 

*READ THIS: 
*Requirements: STATA 16. 	
*Files needed: INS_D_M_Y.csv and Pruebas_D_M_Y.csv Camas_D_M_Y
	
*************************************/


*Setting paths 
clear all

gl path "C:\Users/linar\Dropbox\Personal-Projects\Covid-Colombia"
gl do "C:\Users/linar\Desktop\GitHub\covid19\stata"
	

gl data "$path\data"
gl raw "$data\ins_raw"
gl mod "$data\ins_mod"

cd ${raw}

/*
		Cleaning dataset 	
*/

*import delimited codigo_dpto.csv, encoding(utf8) clear
*save codigo_dpto.dta, replace 

import delimited Pruebas_24_04_2020.csv, encoding(utf8) clear 
save Pruebas.dta, replace 

import delimited Camas_24_04_2020.csv, encoding(utf8) clear 
drop departamento 
save Camas.dta, replace

import delimited INS_24_04_2020.csv, encoding(utf8) clear

*fixing departamento
rename departamentoodistrito departamento

replace departamento=subinstr(departamento, "á", "a",.)
replace departamento=subinstr(departamento, "é", "e",.)
replace departamento=subinstr(departamento, "í", "i",.)
replace departamento=subinstr(departamento, "ó", "o",.)
replace departamento=subinstr(departamento, "ú", "u",.)
replace departamento=ustrupper(departamento, es)

replace departamento="ATLANTICO" if departamento=="BARRANQUILLA D.E."
replace departamento="CHOCO" if departamento=="BUENAVENTURA D.E."
replace departamento="BOLIVAR" if departamento=="CARTAGENA D.T. Y C."
replace departamento="MAGDALENA" if departamento=="SANTA MARTA D.T. Y C." 

*merge with codigo 
merge m:1 departamento using codigo_dpto
drop _merge 
order codigo, after(departamento)

*merge with pruebas 
merge m:1 codigo using Pruebas
drop _merge 

erase Pruebas.dta

*merge with camas 
merge m:1 codigo using Camas 
drop _merge 

erase Camas.dta

*merge with poblacion por departamento 




*time variables
local vars "fechadenotificación fis fechademuerte fechadiagnostico fecharecuperado fechareporteweb"
foreach var in `vars'{
capture split `var', p(T)
capture drop `var'2 
capture order `var'1, after(`var')
capture drop `var'
capture gen `var'=date(`var'1, "YMD")
capture format `var' %td 
capture order `var', after(`var'1)
capture drop `var'1 
}

*cap letters 
local vars "atención sexo tipo estado"
foreach var in `vars'{
replace `var'=ustrupper(`var', es)
}

*encoding variables
local vars "atención sexo tipo estado paísdeprocedencia"
foreach var in `vars'{
encode `var', gen(`var'1)
order `var'1, after(`var')
drop `var'
rename `var'1 `var'
}

*tostring codigo 
tostring codigo, gen(codigostr)
replace codigostr="0"+codigostr if codigo<10 




/*
			Generating variables 	
*/


*Sintomas
gen tipo_sintomas=0 if fis!=. 
replace tipo_sintomas=1 if fis==. 
label define sintomas 0 "SINTOMATICO" 1 "ASINTOMATICO"
label values tipo_sintomas sintomas 

*Tiempo entre notificacion y diagnostico 
gen tiempo_prueba=fechadiagnostico-fechadenotificación
label var tiempo_prueba "tiempo entre diagnóstico y notificación"
gen tiempo_recuperacion=fecharecuperado-fis
label var tiempo_recuperacion "tiempo entre recuperación e inicio de síntomas"
gen tiempo_muerte=fechademuerte-fis 
label var tiempo_muerte "tiempo entre muerte e inicio de síntomas"
gen tiempo_ir_hospital=fechadenotificación-fis
label var tiempo_ir_hospital "tiempo entre fecha de not. e inicio de síntomas"

*Variable de semana 
gen semana=week(fechadiagnostico)
replace semana=semana-9
label var semana "semana de diagnostico después de primer caso confirmado"

*Variable de activo
gen activo=1 if atención==1 | atención==3 | atención==4  
replace activo=0 if atención==2 | atención==5 
label define activo 1 "ACTIVO" 0 "NO ACTIVO"
label values activo activo 
label var activo "Caso sigue activo"

*Dummies atención
tab atención, gen(atencion)
rename atencion1 casa 
rename atencion2 fallecido 
rename atencion3 hospital 
rename atencion4 hospitaluci 
rename atencion5 recuperado

*Dummies tipo 
tab tipo, gen(tipo)
rename tipo1 enestudio 
rename tipo2 importado 
rename tipo3 relacionado

/*
			Generating aggregated variables by departamento
*/

*Casos por departamento
egen casos_confirmados=count(iddecaso), by(departamento)

local vars "activo casa fallecido hospital hospitaluci recuperado enestudio importado relacionado"
foreach var in `vars'{
egen casos_`var'=sum(`var'), by(departamento)
}

*casos en hospital 
gen casos_total_hospital=casos_hospital+casos_hospitaluci 

*asintomaticos 
egen casos_asintomaticos=sum(tipo_sintomas), by(departamento)




*Por semana de diagnóstico 


/*
	Generating working datasets 	
*/

*In this section I generate a daily working dataset.


local vars "pruebas camashospitalizacion camascuidadosintermedios camascuidadosintensivos numerodeprestadores tiempo_prueba tiempo_recuperacion tiempo_muerte tiempo_ir_hospital casos_confirmados casos_activo casos_casa casos_fallecido casos_hospital casos_hospitaluci casos_recuperado casos_enestudio casos_importado casos_relacionado casos_total_hospital casos_asintomaticos"
collapse `vars', by(codigo departamento) 


export delimited using "$mod\departamentos\data_dpto_24_04_2020.csv", replace

local vars "pruebas camashospitalizacion camascuidadosintermedios camascuidadosintensivos numerodeprestadores casos_confirmados casos_activo casos_casa casos_fallecido casos_hospital casos_hospitaluci casos_recuperado casos_enestudio casos_importado casos_relacionado casos_total_hospital casos_asintomaticos"
foreach var in `vars'{
egen nal_`var'=sum(`var')
drop `var'
rename nal_`var' `var'
}

collapse tiempo_prueba tiempo_recuperacion tiempo_muerte tiempo_ir_hospital pruebas camashospitalizacion camascuidadosintermedios camascuidadosintensivos numerodeprestadores casos_confirmados casos_activo casos_casa casos_fallecido casos_hospital casos_hospitaluci casos_recuperado casos_enestudio casos_importado casos_relacionado casos_total_hospital casos_asintomaticos

gen fecha="24-04-2020"
order fecha, first 
export delimited using "$mod\nacional\data_nal_24_04_2020.csv", replace




/*



	Merging working datasets 
*/

*In this section I take all previous datasets and merge them with the one of this day. 