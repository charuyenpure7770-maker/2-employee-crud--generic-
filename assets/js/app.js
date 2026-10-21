const cl = console.log;
const spinner = document.getElementById("spinner");
const empInfo = document.getElementById("empInfo");
const empForm = document.getElementById("empForm");
const eNameControl = document.getElementById("eName");
const departmentControl = document.getElementById("department");
const salaryControl = document.getElementById("salary");
const cityControl = document.getElementById("city");
const  submitBtn= document.getElementById("submitBtn");
const  updateBtn= document.getElementById("updateBtn");


//url 
const BASE_URL = "https://fetch-api-crud-e52ad-default-rtdb.asia-southeast1.firebasedatabase.app"
const EMP_URL = `${BASE_URL}/employees.json`;

//state 
const state = {
    empArr :[],
    EDIT_ID : null
}
//snackBar 
function snackBar(msg ,icon){
    Swal.fire({
        text:msg,
        icon:icon,
        timer:2000
    })
}
//spinner
function showSpinner(){
spinner.classList.remove("d-none");
}
function hideSpinner(){
spinner.classList.add("d-none");
}

//generic function
function makeASpiCall(url,method, msgbody=null){
let body = msgbody ? JSON.stringify(msgbody) : null;
showSpinner();
return fetch(url,{
    method:method,
    body:body,
    headers:{
     "content-type":"applcation/json",
     "authorization":"JWT token"
    }
})
.then((res)=>{
    if(!res.ok){
        throw new Error("something went wrong");
    }
    return res.json();
})
.catch((err)=>{
    snackBar(err.message,"error")
})
.finally(()=>{
    hideSpinner();
})
}


//read
function showOnUi(){
makeASpiCall(EMP_URL,"GET")
.then((data)=>{
    cl(data);
    for(const key in data){
        data[key].id = key;
        state.empArr.push(data[key]);
    }
    templeting(state.empArr);
})
.catch((err)=>{
    snackBar(err.message,"error")
})
}
function templeting(arr){
    let result = ``;
    arr.forEach((ele,i) => {
        result += ` <tr id="${ele.id}">
                          <td>${i+1}</td>
                          <td>${ele.name}</td>
                          <td>${ele.department}</td>
                          <td>${ele.salary}</td>
                          <td>${ele.city}</td>
                          <td><i onclick="onEdit(this)" class="fa-solid fa-pen-to-square fa-2x text-primary"></i></td>
                          <td><i onclick="onRemove(this)" class="fa-solid fa-trash fa-2x text-danger"></i></td>
                      </tr>`
    });
empInfo.innerHTML = result;
}
showOnUi();

//create
function onAddEmp(eve){
    eve.preventDefault();
    let new_obj = {
        name:eNameControl.value,
        department:departmentControl.value,
        salary:salaryControl.value,
        city:cityControl.value
    }
    makeASpiCall(EMP_URL,"POST",new_obj)
    .then((data)=>{
      new_obj.id = data.name;
      state.empArr.push(new_obj);
      let tr = document.createElement("tr");
      tr.id = data.name;
      tr.innerHTML = `<td>${state.empArr.length}</td>
                          <td>${new_obj.name}</td>
                          <td>${new_obj.department}</td>
                          <td>${new_obj.salary}</td>
                          <td>${new_obj.city}</td>
                          <td><i onclick="onEdit(this)" class="fa-solid fa-pen-to-square fa-2x text-primary"></i></td>
                          <td><i onclick="onRemove(this)" class="fa-solid fa-trash fa-2x text-danger"></i></td>`
            empInfo.append(tr); 
            empForm.reset();  
            snackBar("employee is added successfully","success");          
    })
    .catch((err)=>{
        snackBar(err.message,"error");
    })
}
//edit
function onEdit(ele){
    let edit_id = ele.closest("tr").id;
    state.EDIT_ID = edit_id;
    let edit_obj = state.empArr.find(obj=> obj.id === edit_id);
    eNameControl.value = edit_obj.name;
    departmentControl.value = edit_obj.department;
    salaryControl.value = edit_obj.salary;
    cityControl.value = edit_obj.city;
    submitBtn.classList.add("d-none");
    updateBtn.classList.remove("d-none");
}
//update
function onUpdate(){
    let update_id = state.EDIT_ID;
    let update_url = `${BASE_URL}/employees/${update_id}.json`
    let updated_obj = {
        id:update_id,
        name:eNameControl.value,
        department:departmentControl.value,
        salary:salaryControl.value,
        city:cityControl.value
    }
    makeASpiCall(update_url,"PATCH",updated_obj)
    .then((data)=>{
    let getIndex = state.empArr.findIndex(obj=> obj.id === update_id);
    state.empArr[getIndex] = updated_obj;
    let tr = document.getElementById(update_id);
    tr.innerHTML = `<td>${state.empArr.length}</td>
                          <td>${updated_obj.name}</td>
                          <td>${updated_obj.department}</td>
                          <td>${updated_obj.salary}</td>
                          <td>${updated_obj.city}</td>
                          <td><i onclick="onEdit(this)" class="fa-solid fa-pen-to-square fa-2x text-primary"></i></td>
                          <td><i onclick="onRemove(this)" class="fa-solid fa-trash fa-2x text-danger"></i></td>`
                          empForm.reset();
                          updateBtn.classList.add("d-none");
                          submitBtn.classList.remove("d-none");
                          snackBar("employee is updated successfully","success");
    })
}
//delete
function onRemove(ele){
    Swal.fire({
  title: "Are you sure?",
  text: "You won't be able to revert this!",
  icon: "warning",
  showCancelButton: true,
  confirmButtonColor: "#3085d6",
  cancelButtonColor: "#d33",
  confirmButtonText: "Yes, delete it!"
}).then((result) => {
  if (result.isConfirmed){
   
    let remove_id = ele.closest("tr").id;
    let remove_url = `${BASE_URL}/employees/${remove_id}.json`
     makeASpiCall(remove_url,"DELETE")
     .then((data)=>{
    let getIndex = state.empArr.findIndex(obj=> obj.id === remove_id);
    state.empArr.splice(getIndex, 1);
    ele.closest("tr").remove();
    let tr = document.querySelectorAll("#empInfo tr td:first-child");
    tr.forEach((ele,i)=>{
        ele.innerHTML = i+1
    })
    snackBar("employee is removed successfully","success")
     })
    .catch((err)=>{
        snackBar(err.message,"error");
    })
  }
});
}

updateBtn.addEventListener("click",onUpdate);
empForm.addEventListener("submit",onAddEmp);