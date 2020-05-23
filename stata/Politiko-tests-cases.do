
	*******************************
	***** Actualizar politiko *****
	*******************************
	
	global ruta "C:\Users\quiki\OneDrive\Documentos\Stata scripts"
	global ideas "C:\Users\quiki\OneDrive\Documentos\Ideascol\covid19\data"
	cd "$ruta"
	
	import delimited "covid-tests-cases-deaths.csv", clear
	/*
	qui: replace cumulativetests = . if entity == "Italy"
	
	preserve
		qui: keep if entity == "Italy, tests performed"
		qui: replace entity = "Italy"
		keep entity date cumulativetests
		save "$ruta\base_temp.dta", replace
	restore
	
	qui: merge 1:1 entity date using "$ruta\base_temp.dta", update
	cap erase "$ruta\base_temp.dta"
	drop _merge
	*/
	qui: keep if entity == "Germany" | entity == "Italy" | entity == "South Korea" | entity == "United States" | entity == "Sweden"

	qui: replace entity = lower(entity)
	qui: replace entity = "southkorea" if entity == "south korea"
	qui: replace entity = "us" if entity == "united states"
	
	ren cumulativetests tests
	ren totalconfirmeddeathsdeaths deaths
	ren totalconfirmedcasescases cases
	
	qui: replace date = lower(date)
	qui: replace date = subinstr(date,",","",.)
	qui: split date, parse(" ")
	
	forvalues i=1/9 {
		qui: replace date2 = "0`i'" if date2 == "`i'"
	}
	
	qui: replace date = date1 + date2 + date3
	qui: drop date1 date2 date3
	
	qui: gen date1 = date(date,"MDY")
	qui: format date1 %tdNN/DD/CCYY
	qui: drop date
	qui: ren date1 Date
	
	sort entity Date
	
	drop code
	
	global vars "tests cases deaths"
	global countries "germany italy southkorea us sweden"
	
	qui: drop if tests == . & cases == . & deaths == .
	
	preserve
		clear
		qui: set obs 1
		qui: gen Date = "Date"
		qui: gen cases = "Total Confirmed Cases"
		qui: gen tests = "Total Tests"
		qui: gen deaths = "Total deaths"
		save "headers_pol.dta", replace
	restore	
	
	save "base_inicial.dta", replace
	
	** Politikos excepto Col **
	
	foreach x of global countries {
		*local x = "us"
		preserve 
		qui: keep if entity == "`x'"
		qui: drop entity
		qui: generate text  = string(Date, "%tdNN/DD/CCYY")
		qui: drop Date
		ren text Date
		order Date cases tests deaths
		
		foreach y of global vars {
			qui: tostring `y', replace
			qui: replace `y' = "" if `y' == "."
		}
		save "data_`x'.dta", replace
		restore
	}
	
	foreach x of global countries {
		clear
		*local x = "us"
		use "headers_pol.dta", clear
		append using "data_`x'.dta", force
		cap erase "data_`x'.dta"
		export delimited "$ideas\data_`x'.csv", delimiter(",") replace novarnames
		
	}
	
	** Politiko Col ** 
	
	import delimited "$ideas/datos_nal.csv", delimiter(",") varn(1) clear
	
	qui: keep fecha pruebasrealizadas casosconfirmadostotales fallecidostotales
	ren fecha Date
	ren pruebasrealizadas tests  
	ren casosconfirmadostotales cases
	ren fallecidostotales deaths
	order Date cases tests deaths
	
	foreach y of global vars {
		qui: tostring `y', replace
		qui: replace `y' = "" if `y' == "."
	}
	
	qui: replace deaths = "" if deaths == "0"
	
	save "$ruta/data_col.dta", replace

	use "headers_pol.dta", clear
	append using "data_col.dta", force
	export delimited "$ideas\data_col.csv", delimiter(",") replace novarnames
	
	** 200 Confirmed Cases and tests **

	use "$ruta/data_col.dta", clear
	
	qui: drop in 1/16
	qui: drop Date

	foreach y of global vars {
		preserve
		qui: keep `y'
		qui: gen Day = _n
		qui: ren `y' Colombia
		save "$ruta/200`y'_col.dta", replace
		restore
	}
	
	preserve
		import delimited "population.csv", delimiter(",") varn(1) clear charset("UTF-8")
		qui: keep if entity == "Colombia"
		qui: drop entity
		levelsof population2018, local(pob)
		global col_pob `pob'
	restore
	
	qui: destring _all, replace
	qui: gen pob = $col_pob
	
	qui: replace cases  = cases/pob*1000000
	qui: replace tests  = tests/pob*1000000
	qui: replace deaths = deaths/pob*1000000

	format cases  %10.2f
	format tests  %10.2f
	format deaths %10.2f
	
	qui: drop pob
	
	preserve
		qui: keep cases
		qui: gen Day = _n
		qui: ren cases Colombia
		save "million200cases_col.dta", replace
	restore
	
	preserve
		qui: keep deaths
		qui: gen Day = _n
		qui: ren deaths Colombia
		save "million200deaths_col.dta", replace
	restore
	
	qui: keep tests
	qui: gen Day = _n
	qui: ren tests Colombia
	save "million200tests_col.dta", replace
	

	
	foreach x of global countries {
		*local x = "sweden"
		use "base_inicial.dta", replace
		keep if entity == "`x'"
		drop if cases < 200
		drop entity
		
		foreach y of global vars {
			preserve
			qui: keep `y'
			qui: gen Day = _n
			qui: ren `y' `x'
			save "$ruta/200`y'_`x'.dta", replace
			restore
		}
		
		preserve
			import delimited "population.csv", delimiter(",") varn(1) clear charset("UTF-8")
			qui: keep if entity == "`x'"
			qui: drop entity
			levelsof population2018, local(pob)
			global col_pob `pob'
		restore
		
		qui: destring _all, replace
		qui: gen pob = $col_pob
		
		qui: replace cases  = cases/pob*1000000
		qui: replace tests  = tests/pob*1000000
		qui: replace deaths = deaths/pob*1000000
		

		format cases  %10.2f
		format tests  %10.2f
		format deaths %10.2f
		
		qui: drop pob
	
		preserve
			qui: keep cases
			qui: gen Day = _n
			qui: ren cases `x'
			save "million200cases_`x'.dta", replace
		restore
		
		preserve
			qui: keep deaths
			qui: gen Day = _n
			qui: ren deaths `x'
			save "million200deaths_`x'.dta", replace
		restore
		
		qui: keep tests
		qui: gen Day = _n
		qui: ren tests `x'
		save "million200tests_`x'.dta", replace
	}

	
	* Cases
	
	preserve
		clear
		qui: set obs 1
		qui: gen Day = "Day (200 total cases)"
		qui: gen germany = "Germany"
		qui: gen italy = "Italy"
		qui: gen us = "United States"
		qui: gen southkorea = "South Korea"
		qui: gen sweden = "Sweden"
		qui: gen Colombia = "Colombia"
		save "headers_cases.dta", replace
	restore	
	
	
	use "$ruta/200cases_col.dta", replace
	destring Colombia, replace
	foreach x of global countries {
		merge 1:1 Day using "$ruta/200cases_`x'.dta"
		qui: drop _merge
		cap erase "$ruta/200cases_`x'.dta"
	}
	
	order Day germany italy us southkorea sweden Colombia
	tostring _all, replace
	save "$ruta/200cases_countries", replace
	cap erase "$ruta/200cases_col.dta"
	
	use "headers_cases.dta", replace
	append using "$ruta/200cases_countries"
	
	foreach x of var _all {
		replace `x' = "" if `x' == "."
	}

	export delimited "$ideas\data_200day_confirmed_cases_countries.csv", delimiter(",") replace novarnames

	
	use "$ruta/million200cases_col.dta", replace
	destring Colombia, replace
	foreach x of global countries {
		merge 1:1 Day using "$ruta/million200cases_`x'.dta"
		qui: drop _merge
		cap erase "$ruta/million200cases_`x'.dta"
	}
	
	order Day germany italy us southkorea sweden Colombia
	
	tostring Day, replace
	
	qui: generate text  = string(Colombia, "%10.2f")
	qui: drop Colombia 
	ren text Colombia
	
	foreach x of global countries {
		qui: generate text  = string(`x', "%10.2f")
		qui: drop `x' 
		ren text `x'
	}
	
	save "$ruta/million200cases_countries", replace
	cap erase "$ruta/million200cases_col.dta"
	
	use "headers_cases.dta", replace
	append using "$ruta/million200cases_countries"
	
	foreach x of var _all {
		replace `x' = "" if `x' == "."
	}

	export delimited "$ideas\data_million_confirmed_cases_countries.csv", delimiter(",") replace novarnames

	
	* Deaths

	use "$ruta/200deaths_col.dta", replace
	destring Colombia, replace
	foreach x of global countries {
		merge 1:1 Day using "$ruta/200deaths_`x'.dta"
		qui: drop _merge
		cap erase "$ruta/200deaths_`x'.dta"
	}
	
	order Day germany italy us southkorea sweden Colombia
	tostring _all, replace
	save "$ruta/200deaths_countries", replace
	cap erase "$ruta/200deaths_col.dta"
	
	use "headers_cases.dta", replace
	append using "$ruta/200deaths_countries"
	
	foreach x of var _all {
		replace `x' = "" if `x' == "."
	}

	*export delimited "$ideas\data_200day_deaths_countries.csv", delimiter(",") replace novarnames

	
	use "$ruta/million200deaths_col.dta", replace
	destring Colombia, replace
	foreach x of global countries {
		merge 1:1 Day using "$ruta/million200deaths_`x'.dta"
		qui: drop _merge
		cap erase "$ruta/million200deaths_`x'.dta"
	}
	
	order Day germany italy us southkorea sweden Colombia
	
	tostring Day, replace
	
	qui: generate text  = string(Colombia, "%10.2f")
	qui: drop Colombia 
	ren text Colombia
	
	foreach x of global countries {
		qui: generate text  = string(`x', "%10.2f")
		qui: drop `x' 
		ren text `x'
	}
	
	save "$ruta/million200deaths_countries", replace
	cap erase "$ruta/million200deaths_col.dta"
	
	use "headers_cases.dta", replace
	append using "$ruta/million200deaths_countries"
	
	foreach x of var _all {
		replace `x' = "" if `x' == "."
	}

	export delimited "$ideas\data_million_deaths_countries.csv", delimiter(",") replace novarnames
	
	
	* Tests
	
	preserve
		clear
		qui: set obs 1
		qui: gen Day = "Day(200 confirmed cases)"
		qui: gen germany = "Germany"
		qui: gen italy = "Italy"
		qui: gen us = "United States"
		qui: gen southkorea = "South Korea"
		qui: gen sweden = "Sweden"
		qui: gen Colombia = "Colombia"
		save "headers_tests.dta", replace
	restore	
	
	
	use "$ruta/200tests_col.dta", replace
	destring Colombia, replace
	foreach x of global countries {
		merge 1:1 Day using "$ruta/200tests_`x'.dta"
		qui: drop _merge
		cap erase "$ruta/200tests_`x'.dta"
	}
	
	order Day germany italy us southkorea sweden Colombia
	tostring _all, replace
	save "$ruta/200tests_countries", replace
	cap erase "$ruta/200tests_col.dta"
	
	use "headers_tests.dta", replace
	append using "$ruta/200tests_countries"
	
	foreach x of var _all {
		replace `x' = "" if `x' == "."
	}

	export delimited "$ideas\data_200day_tests_countries.csv", delimiter(",") replace novarnames

	
	
	
	
	
	use "$ruta/million200tests_col.dta", replace
	destring Colombia, replace
	foreach x of global countries {
		merge 1:1 Day using "$ruta/million200tests_`x'.dta"
		qui: drop _merge
		cap erase "$ruta/million200tests_`x'.dta"
	}
	
	order Day germany italy us southkorea sweden Colombia
	
	tostring Day, replace
	
	qui: generate text  = string(Colombia, "%10.2f")
	qui: drop Colombia 
	ren text Colombia
	
	foreach x of global countries {
		qui: generate text  = string(`x', "%10.2f")
		qui: drop `x' 
		ren text `x'
	}
	
	save "$ruta/million200tests_countries", replace
	cap erase "$ruta/million200tests_col.dta"
	
	use "headers_tests.dta", replace
	append using "$ruta/million200tests_countries"
	
	foreach x of var _all {
		replace `x' = "" if `x' == "."
	}

	export delimited "$ideas\data_million_tests_countries.csv", delimiter(",") replace novarnames

	cap erase million200tests_countries.dta
	cap erase million200cases_countries.dta
	cap erase headers_tests.dta
	cap erase headers_pol.dta
	cap erase headers_cases.dta
	cap erase data_col.dta
	cap erase 200tests_countries.dta
	cap erase 200cases_countries.dta
	cap erase base_inicial.dta
	cap erase million200deaths_countries.dta
	cap erase 200deaths_countries.dta
	
