"use strict";

window.addEventListener("DOMContentLoaded", start);

let allStudents = [];
let familyBlood;

// The prototype for all students:
const Student = {
  name: "",
  middleName: "",
  lastName: "",
  house: "",
  gender: "",
  expelled: false,
  bloodStatus: "",
  prefect: false,
  inqSquad: false,
};

const settings = {
  filter: "all",
  sortBy: "name",
  sortDir: "asc",
};

function start() {
  console.log("ready");

  loadJSON();
  // Add event-listeners to filter and sort buttons
  registerButtons();
}

function registerButtons() {
  document
    .querySelectorAll("[data-action='filter']")
    .forEach((button) => button.addEventListener("click", selectFilter));

  document
    .querySelectorAll("[data-action='sort']")
    .forEach((button) => button.addEventListener("click", selectSort));
}

async function loadJSON() {
  try {
    // Fetch the first JSON file
    const response1 = await fetch("students.json");
    const data1 = await response1.json();
    console.log(data1);

    // Fetch the second JSON file
    const response2 = await fetch("families.json");
    familyBlood = await response2.json();
    console.log(familyBlood);

    prepareObjects(data1);
  } catch (error) {
    console.error("Error fetching JSON:", error);
  }
}

// async function loadJSON() {
//   console.log("loadJSON");

//   const response = await fetch("students.json");
//   const jsonData = await response.json();

//   // when loaded, prepare data objects
//   prepareObjects(jsonData);
// }

function prepareObjects(jsonData) {
  console.log("prepareObjects");

  allStudents = jsonData.map(prepareObject);

  buildList();
}

function addBloodStatus(thisStudent) {
  console.log("thisStudent.lastName:", thisStudent.lastName);

  if (familyBlood.half.includes(thisStudent.lastName)) {
    thisStudent.bloodStatus = "Halfblood";
  } else if (familyBlood.pure.includes(thisStudent.lastName)) {
    thisStudent.bloodStatus = "Pureblood";
  } else {
    thisStudent.bloodStatus = "Muggleblood";
  }

  return thisStudent;
}

function prepareObject(jsonObject) {
  console.log("prepareObject");

  const student = Object.create(Student);

  addBloodStatus(student);

  const texts = jsonObject.fullname.trim().split(/\s+/);

  // set name, middleName, and lastName based on fullname
  if (texts.length === 1) {
    student.name =
      texts[0].charAt(0).toUpperCase() + texts[0].slice(1).toLowerCase();
  } else if (texts.length === 2) {
    student.name =
      texts[0].charAt(0).toUpperCase() + texts[0].slice(1).toLowerCase();
    student.lastName =
      texts[1].charAt(0).toUpperCase() + texts[1].slice(1).toLowerCase();
  } else if (texts.length === 3) {
    student.name =
      texts[0].charAt(0).toUpperCase() + texts[0].slice(1).toLowerCase();
    student.middleName =
      texts[1].charAt(0).toUpperCase() + texts[1].slice(1).toLowerCase();
    student.lastName =
      texts[2].charAt(0).toUpperCase() + texts[2].slice(1).toLowerCase();
  } else if (texts.length > 3) {
    student.name =
      texts[0].charAt(0).toUpperCase() + texts[0].slice(1).toLowerCase();
    student.middleName = texts
      .slice(1, -1)
      .map((name) => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase())
      .join(" ");
    student.lastName =
      texts[texts.length - 1].charAt(0).toUpperCase() +
      texts[texts.length - 1].slice(1).toLowerCase();
  }

  // set house property
  student.house =
    jsonObject.house
      .trim()
      .replace(/\s+/g, " ")
      .replace(/[^a-zA-Z ]/g, "")
      .charAt(0)
      .toUpperCase() + jsonObject.house.slice(1).toLowerCase();

  return student;
}

function selectFilter(event) {
  const filter = event.target.dataset.filter;
  console.log(`User selected ${filter}`);
  // filterList(filter);
  setFilter(filter);
}

function setFilter(filter) {
  settings.filterBy = filter;
  buildList();
}

function filterList(filteredList) {
  if (settings.filterBy === "Ravenclaw") {
    filteredList = allStudents.filter(isRavenclaw);
  } else if (settings.filterBy === "Gryffindor") {
    filteredList = allStudents.filter(isGryffindor);
  } else if (settings.filterBy === "Hufflepuff") {
    filteredList = allStudents.filter(isHufflepuff);
  } else if (settings.filterBy === "Slytherin") {
    filteredList = allStudents.filter(isSlytherin);
  } else if (settings.filterBy === "inqSquad") {
    filteredList = allStudents.filter(isInqSquad);
  } else if (settings.filterBy === "prefect") {
    filteredList = allStudents.filter(isPrefect);
  }

  return filteredList;
}

function isRavenclaw(student) {
  return student.house === "Ravenclaw";
}

function isGryffindor(student) {
  return student.house === "Gryffindor";
}

function isHufflepuff(student) {
  return student.house === "Hufflepuff";
}

function isSlytherin(student) {
  return student.house === "Slytherin";
}

function isInqSquad(student) {
  return student.inqSquad === true;
}

function isPrefect(student) {
  return student.prefect === true;
}

function selectSort(event) {
  const sortBy = event.target.dataset.sort;
  const sortDir = event.target.dataset.sortDirection;

  // find "old" sortby element, and remove .sortBy
  const oldElement = document.querySelector(`[data-sort='${settings.sortBy}']`);
  oldElement.classList.remove("sortby");

  // indicate active sort
  event.target.classList.add("sortby");

  // toggle direction
  if (sortDir === "asc") {
    event.target.dataset.sortDirection = "lastName";
  } else {
    event.target.dataset.sortDirection = "asc";
  }
  console.log(`User selected ${sortBy} - ${sortDir}`);
  setSort(sortBy, sortDir);
}

function setSort(sortBy, sortDir) {
  settings.sortBy = sortBy;
  settings.sortDir = sortDir;
  buildList();
}

function sortList(sortedList) {
  // let sortedList = allStudents;
  let direction = 1;
  if (settings.sortDir === "lastName") {
    direction = -1;
  } else {
    settings.direction = 1;
  }

  sortedList = sortedList.sort(sortByProperty);

  function sortByProperty(studentA, studentB) {
    if (studentA[settings.sortBy] < studentB[settings.sortBy]) {
      return -1 * direction;
    } else {
      return 1 * direction;
    }
  }

  return sortedList;
}

function buildList() {
  const currentList = filterList(allStudents);
  const sortedList = sortList(currentList);

  displayList(sortedList);
  console.log(`Built list with ${sortedList.length} students`);
}

function displayList(students) {
  console.log(`Displaying list of ${students.length} students`);
  // clear the list
  document.querySelector("#list tbody").innerHTML = "";

  // build a new list
  students.forEach(displayStudent);
}

function displayStudent(student) {
  console.log(`Displaying student: ${student.name} ${student.lastName}`);
  // create clone
  const clone = document
    .querySelector("template#student")
    .content.cloneNode(true);

  // set clone data
  clone.querySelector("[data-field=name]").textContent = student.name;
  clone.querySelector("[data-field=lastName]").textContent = student.lastName;
  clone.querySelector("[data-field=house]").textContent = student.house;

  if (student.inqSquad === true) {
    clone.querySelector("[data-field=inqSquad]").textContent = "★";
  } else {
    clone.querySelector("[data-field=inqSquad]").textContent = "☆";
  }

  clone
    .querySelector("[data-field=inqSquad]")
    .addEventListener("click", clickInqSquad);

  function clickInqSquad() {
    if (student.inqSquad === true) {
      student.inqSquad = false;
    } else {
      student.inqSquad = true;
    }
    console.log(
      `Toggling inqsquad status for ${student.name} ${student.lastName}`
    );

    buildList();
  }

  if (student.prefect === true) {
    clone.querySelector("[data-field=prefect]").textContent = "ⓟ";
  } else {
    clone.querySelector("[data-field=prefect]").textContent = "◯";
  }

  clone
    .querySelector("[data-field=prefect]")
    .addEventListener("click", clickPrefect);

  function clickPrefect() {
    if (student.prefect === true) {
      student.prefect = false;
    } else {
      student.prefect = true;
    }
    console.log(
      `Toggling prefect status for ${student.name} ${student.lastName}`
    );

    buildList();
  }

  clone.querySelector("tr").addEventListener("click", () => {
    displayPopup(student);
  });

  // append clone to list
  document.querySelector("#student-rows").appendChild(clone);
}

function displayPopup(student) {
  const studentPopup = document.getElementById("student-popup");
  console.log("displayPopup");

  // set the student data in the popup
  document.querySelector(
    "#student-popup-header"
  ).textContent = `${student.name} ${student.middleName} ${student.lastName}`;

  if (student.middleName) {
    document.querySelector(
      "#student-photo"
    ).src = `pictures/${student.name} ${student.middleName} ${student.lastName}.png`;
  } else if (student) {
    document.querySelector(
      "#student-photo"
    ).src = `pictures/${student.name} ${student.lastName}.png`;
  } else if (student.name === "Justin") {
    document.querySelector(
      "#student-photo"
    ).src = `pictures/Justin_Finch-Fletchey.png`;
  }

  document.querySelector(
    "#student-house"
  ).textContent = `House: ${student.house}`;
  document.querySelector(
    "#student-blood-status"
  ).textContent = `Blood Status: ${student.bloodStatus}`;
  document.querySelector("#student-prefect").textContent = `Prefect: ${
    student.prefect ? "Yes" : "No"
  }`;
  document.querySelector("#student-expelled").textContent = `Expelled: ${
    student.expelled ? "Yes" : "No"
  }`;
  document.querySelector(
    "#student-inquisitorial-squad"
  ).textContent = `Inquisitorial Squad: ${student.inqSquad ? "Yes" : "No"}`;

  // add event listener to the remove student button
  document
    .querySelector("#remove-student-btn")
    .addEventListener("click", () => {
      removeStudent(student);
    });

  // add event listener to the prefect button
  document.querySelector("#make-inq-btn").addEventListener("click", () => {
    isInqSquad(student);
  });

  if (student.house === "Gryffindor") {
    studentPopup.style.borderColor = "#8D0000";
  } else if (student.house === "Slytherin") {
    studentPopup.style.borderColor = "#004600";
  } else if (student.house === "Hufflepuff") {
    studentPopup.style.borderColor = "#D8A406";
  } else if (student.house === "Ravenclaw") {
    studentPopup.style.borderColor = "#003063";
  }

  // display the popup
  document.querySelector("#student-popup").style.display = "block";
}

function isInqSquad(student) {
  console.log("isPrefect");

  if (student.inqSquad === true) {
    student.inqSquad = false;
  } else {
    student.inqSquad = true;
  }
  console.log(
    `Toggling inquisitorial squad status for ${student.name} ${student.lastName}`
  );

  buildList();
  document.querySelector(
    "#student-inquisitorial-squad"
  ).textContent = `Inquisitorial Squad: Yes`;

  // rebuild the student list
  buildList();
}

function removeStudent(student) {
  console.log("removeStudent");
  student.expelled = true;
  student.prefect = false;
  // remove the student from the allStudents array
  const index = allStudents.indexOf(student);
  if (index > -1) {
    allStudents.splice(index, 1);
  }

  document.querySelector("#student-expelled").textContent = `Expelled: Yes`;

  // rebuild the student list
  buildList();
}
