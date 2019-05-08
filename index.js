const { getAllFilePathsWithExtension, readFile } = require('./fileSystem');
const { readLine } = require('./console');
const path = require('path');

app();
var todoArrayObject=[];
function Todo(importance,user,date,info,fileName){
	this.importance = importance;
	this.user = user;
	this.date = date;
	this.info = info;
	this.fileName = fileName;
}
/**
 * [makeTodoObjects description]
 * @param  {[array]} todoArray Массив со всеми todo
 * При помощи функций checkImportance и checkOtherInfo
 * превращяем массив с todo, в массив с обьектами todo
 */
function makeTodoObjects(todoArray) {
	todoArrayObject=[];
	for(var i=0;i<todoArray[0].length;i++){
		if(!checkOtherInfo(todoArray[0][i])){
			continue;
		}
		var importance=checkImportance(todoArray[0][i]);
		var user=checkOtherInfo(todoArray[0][i])[0];
		var date=checkOtherInfo(todoArray[0][i])[1];
		var info=checkOtherInfo(todoArray[0][i])[2];
		var fileName=todoArray[1][i];
		todoArrayObject.push(new Todo(importance,user,date,info,fileName));
	}
}
/**
 * Обьект конфигов под пространство при выводе
 * Вводим количество символов под каждую категорию
 * @param {[string]} importance 
 * @param {[string]} user       
 * @param {[string]} date       
 * @param {[string]} comment    
 * @param {[string]} fileName   
 */
function ConfigSpace(importance,user,date,info,fileName){
	this.importance = importance;
	this.user = user;
	this.date = date;
	this.info = info;
	this.fileName = fileName;
}
var configMaxSpace=new ConfigSpace(1,10,10,50,15);//Максимальные настройки под свободное место
var configDefSpace=new ConfigSpace(1,4,4,7,8);//Дефолтные настройки под свободное место
var configForList=new ConfigSpace(1,4,4,7,8);


function app () {
    const files = getFiles();

    console.log('Please, write your command!');
    readLine(processCommand);
}

function getFiles () {
    const filePaths = getAllFilePathsWithExtension(process.cwd(), 'js');
    return filePaths.map(path => readFile(path));
}


/**
 * Из todo достаем все восклицательные знаки
 * Чтобы в далнейшем сохранить их в свойство importance
 */
function checkImportance(todo) {
	var importance="";
	if(!todo.match(/!/g)){
		return "";
	}
	for(var i=0;i<(todo.match(/!/g).length);i++){
		importance=importance+"!";
	}
	return importance;	
}
/**
 * Разбиваем todo на массив [имя,дата,коментарий]
 */
function checkOtherInfo(todo){
	var posTodo=todo.search(/todo/i)
	var newTodo=todo.substring(posTodo+4);
	newTodo=newTodo.trim();
	newTodo=newTodo.split(";");
	if(newTodo.length==0||newTodo.length==2||newTodo.length>3){
		return false;
	}
	for(var i=0;i<newTodo.length;i++){
		newTodo[i]=newTodo[i].trim();
	}
	if(newTodo.length===1){
		newTodo[2]=newTodo[0];
		newTodo[1]="";
		newTodo[0]="";
	}
	return newTodo;
}
/**
 * Проверяем каждый файл, достаем из него todo
 * и сохраняем их в двумерный массив с [todo][fileName]
 */
function reCheckSoloFiles() {
	var reg=/\/\/\s{0,}todo[\s\:].{1,}/ig;
	var filesArray=getFiles();
	var nameFiles=getAllFilePathsWithExtension(process.cwd(), 'js');
	var todoArray=[];
	todoArray[0]=[];
	todoArray[1]=[];
	for (var i = 0; i < filesArray.length; i++) {
		if(filesArray[i].match(reg)){
			todoArray[0]=todoArray[0].concat(filesArray[i].match(reg));
			for(var j=0; j<filesArray[i].match(reg).length;j++){
				todoArray[1]=todoArray[1].concat(path.basename(nameFiles[i]));
			}	
		}				
	}
	makeTodoObjects(todoArray);
}

function makeConfigForList() {
	for(var key in configDefSpace){
		configForList[key]=configDefSpace[key];
	}
	for(var i=0;i<todoArrayObject.length;i++){
		for(var key in todoArrayObject[i]){
			findLargestString(todoArrayObject[i],key);
		}
	}
}

function findLargestString(todoObject,nameString){
	if(todoObject[nameString].length>configForList[nameString]){
                configForList[nameString]=todoObject[nameString].length;
        }
    if(todoObject[nameString].length>configMaxSpace[nameString]){
                configForList[nameString]=configMaxSpace[nameString];
        }
}

function addSpaces(string,amount){
	for(var i=0;i<amount;i++){
		string=string+(" ");
	}
	return string;
}
/**
 * Создаем первую строку, вторую
 * Генерируем для каждого todo свою строку
 * обьеденяем их и выводим в консоль
 */
function writeResult(){
	var firstString="  !  |  user";
	firstString=addSpaces(firstString,(configForList.user-configDefSpace.user));
	firstString=firstString+("  |  date");
	firstString=addSpaces(firstString,(configForList.date-configDefSpace.date));
	firstString=firstString+("  |  comment");
	firstString=addSpaces(firstString,(configForList.info-configDefSpace.info));
	firstString=firstString+("  |  fileName  ");
	firstString=addSpaces(firstString,(configForList.fileName-configDefSpace.fileName));
	var secondString="";
	for(var i=0;i<firstString.length;i++){
		secondString=secondString+("-");
	}
	var resultShow=firstString + '\n' +secondString;
	if(todoArrayObject<1){
		console.log(firstString + '\n' +secondString);
		return;
	}
	for(var j=0;j<todoArrayObject.length;j++){
		var showTodo="";
		if(todoArrayObject[j].importance.length>0){
			showTodo=showTodo+"  !  |  ";
		}else{
			showTodo=showTodo+"     |  ";
		}
		for(var key in todoArrayObject[j]){
			if(key=="importance"){
				continue;
			}
			if(todoArrayObject[j][key].length>configForList[key]){
				showTodo=showTodo+(todoArrayObject[j][key].substring(0,configForList[key]-3)+"...");	
			}else{
				showTodo=showTodo+todoArrayObject[j][key];
				showTodo=addSpaces(showTodo,(configForList[key]-todoArrayObject[j][key].length));
			}
			if(key!="fileName"){
				showTodo=showTodo+"  |  ";
			}else{
				showTodo=showTodo+"  ";
			}
			
		}
		resultShow=resultShow+'\n'+showTodo;
	}
	console.log(resultShow+'\n'+secondString);
}
function deleteNotImportant(){
	todoArrayObject=todoArrayObject.filter(i => i.importance.length > 0);
}
function deleteNotUser(userName){
	var regExpUserName=new RegExp(userName,"i");
	todoArrayObject=todoArrayObject.filter(i => i.user.match(regExpUserName));
}
function deleteInvalidDate(date){
	var requestDate=new Date(date);
	todoArrayObject=todoArrayObject.filter(function(i){
		var checkDate=new Date(i.date);
		return checkDate!="Invalid Date" && checkDate>=requestDate;
	});
}


function sortImportances(){
	todoArrayObject.sort(function(a, b){
		var totalA=a.importance.length, totalB=b.importance.length;
	 	if (totalA > totalB){
	  		return -1;
	  	}
	 	if (totalA < totalB){
	  		return 1;
	  	}
		return 0; //default return value (no sorting)
	});
}
/**
 * [sortUser description]
 * Сортируем по юзеру, если юзера нет отправляем вниз списка
 */
function sortUser(){
	todoArrayObject.sort(function(a, b){
		var totalA=a.user.toUpperCase(), totalB=b.user.toUpperCase();
		if(totalA.length==0 && !totalB.length==0){
			return 1;
		}
		if(totalB.length==0 && !totalA.length==0){
			return -1;
		}
	 	if (totalA < totalB){
	  		return -1;
	  	}
	 	if (totalA > totalB){
	  		return 1;
	  	}
		return 0; //default return value (no sorting)
	});
}
/**
 * [sortDate description]
 * Сортируем по дате, если строка пустая 
 * отправляем эту todo вниз таблицы
 */
function sortDate(){
	todoArrayObject.sort(function(a, b){
		var totalA=new Date (a.date);
        var totalB=new Date (b.date);
		if(totalA=="Invalid Date"){
			totalA="";
		}
		if(totalB=="Invalid Date"){
			totalB="";
		}
		if(totalA.length==0 && !totalB.length==0){
			return 1;
		}
		if(totalB.length==0 && !totalA.length==0){
			return -1;
		}
	 	if (totalA > totalB){
	  		return -1;
	  	}
	 	if (totalA < totalB){
	  		return 1;
	  	}
		return 0; //default return value (no sorting)
	});
}
/**
 * [commandConsole description]
 * @param  {[fun]}      functionToWork Передаем функцию, которая проделывает нужную операцию с массивом
 * @param  {[variable]} parameter      Передаем параметр если он необходим для функции
 *
 * reCheckSoloFiles-перебираем все файлы, достаем необходимые нам строки записываем их в двумерный массив
 * 					[строка,название файла], сохраняем в todoArray
 * makeTodoObjects(запускается из reCheckSoloFiles)-Для каждого todo Создаем обьект, сохраняем все обьекты типа todo в массив todoArrayObject
 * makeConfigForList - создаем конфиг для вывода в нем хранятся данные какого размера столбцы должны быть в
 * 					   этом выводе.
 * writeResult - Вывод результата
 */
function commandConsole(functionToWork,parameter){
	reCheckSoloFiles();
	if(functionToWork){
		functionToWork(parameter);
	}	
	makeConfigForList();
	writeResult();
}

function processCommand (command) {
    switch (command) {
        case (command.match(/^exit/i) || {}).input:
            process.exit(0);
            break;
		case (command.match(/^show/i) || {}).input:
			commandConsole();
			break
		case (command.match(/^important/i) || {}).input:
			commandConsole(deleteNotImportant);
			break;
		case (command.match(/^user\s/i) || {}).input:
			commandConsole(deleteNotUser,"^"+command.substring(5,));
			break;
		case (command.match(/^sort\simportance/i) || {}).input:
			commandConsole(sortImportances);
			break;
		case (command.match(/^sort\suser/i) || {}).input:
			commandConsole(sortUser);
			break;	
		case (command.match(/^sort\sdate/i) || {}).input:
			commandConsole(sortDate);
			break;
		case (command.match(/^date\s\d\d\d\d/i) || {}).input:
			commandConsole(deleteInvalidDate,command.substring(5,));
			break;
        default:
            console.log('wrong command');
            break;
    }
}
// TODO you can do it!
