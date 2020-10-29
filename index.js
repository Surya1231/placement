let Placements = [];
let Internships = [];
let Search = "";
let Recruitment = "Placement";

const PLACEMENT_RECRUITMENT = "Placement";

function fnExcelReport() {
  let tab_text = "<table border='2px'><tr bgcolor='#87AFC6'>";
  let textRange;
  let j = 0;
  const tab = document.getElementById("data"); // id of table
  for (j = 0; j < tab.rows.length; j++) {
    tab_text = tab_text + tab.rows[j].innerHTML + "</tr>";
  }
  tab_text = tab_text + "</table>";
  const ua = window.navigator.userAgent;
  const msie = ua.indexOf("MSIE ");
  if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
    txtArea1.document.open("txt/html", "replace");
    txtArea1.document.write(tab_text);
    txtArea1.document.close();
    txtArea1.focus();
    sa = txtArea1.document.execCommand("SaveAs", true, "Say Thanks to Surya.xls");
  } else sa = window.open("data:application/vnd.ms-excel," + encodeURIComponent(tab_text));
  return sa;
}

async function fetchData() {
  return new Promise((resolve) => {
    fetch("https://cors-anywhere.herokuapp.com/http://placements.mnit.ac.in/api/placements/getAll", { method: "POST" })
      .then((res) => res.json())
      .then((res) => {
        const data = res.placements;

        Placements = [];
        Internships = [];
        data.forEach((item) => {
          let obj = {
            student_name: item.students[0].student_name,
            branch: item.students[0].department,
            company_name: item.company_name,
            recruitment_type: item.recruitment_type,
            batch: item.passout_batch,
            job_profile: item.job_profile,
            package: item.recruitment === PLACEMENT_RECRUITMENT ? item.package : item.intern_stipend,
          };
          if (item.recruitment == PLACEMENT_RECRUITMENT) Placements.push(obj);
          else Internships.push(obj);
        });

        Placements.sort((o1, o2) => o2.package - o1.package);
        Internships.sort((o1, o2) => o2.package - o1.package);
        resolve();
      })
      .catch((err) => resolve(err))
      .catch((err) => resolve(err));
  });
}

function renderTable() {
  const Data = Recruitment === PLACEMENT_RECRUITMENT ? Placements : Internships;
  console.log(Data, Recruitment, Placements, Internships);
  const branchInfo = {};
  const globalInfo = { total_students: 0, total_package: 0, max_package: 0 };
  const filter = Search.toLowerCase();
  let index = 1;
  let html = "<tr><th>Sr No</th><th>Name</th><th>Branch</th><th>Company</th><th>Type</th><th>Package</th></tr>";

  Data.forEach((item) => {
    const { student_name, branch, company_name, recruitment_type, batch, job_profile, package } = item;

    const full_text = [student_name, branch, company_name, recruitment_type, batch, job_profile, package].join("%");

    if (full_text.toLowerCase().indexOf(filter) !== -1) {
      html += `<tr>
                <td> ${index} </td>
                <td> ${student_name} </td>
                <td> ${branch} </td>
                <td> ${company_name} </td>
                <td> ${recruitment_type} </td>
                <td> ${package} </td>
            </tr>`;

      if (!branchInfo[branch]) branchInfo[branch] = { total_students: 0, total_package: 0, max_package: 0 };

      branchInfo[branch].total_students++;
      branchInfo[branch].total_package += Number(package);
      branchInfo[branch].max_package = Math.max(branchInfo[branch].max_package, Number(package));

      globalInfo.total_students++;
      globalInfo.total_package += Number(package);
      globalInfo.max_package = Math.max(globalInfo.max_package, Number(package));

      index++;
    }
  });

  html += "<tr><td colspan='6'> -- </td></tr><tr><th colspan='6'> Analytics </th> </tr><tr><td colspan='6'> -- </td></tr>";
  html += '<tr><th colspan="3">  Branch </th><th>Total placed</th><th>Highest</th><th>Average</th></tr>';

  Object.keys(branchInfo).forEach((key) => {
    html += `<tr><th colspan="3">  ${key} </th><td> ${branchInfo[key].total_students}</td><td>${branchInfo[key].max_package}</td><td>${Number(
      (branchInfo[key].total_package / branchInfo[key].total_students).toFixed(2)
    )}</td></tr>`;
  });

  html += "<tr><td colspan='6'> -- </td></tr>";
  html += `<tr><th colspan="3"> Cummulative </th><td> ${globalInfo.total_students}</td><td> ${globalInfo.max_package} </td><td>${Number(
    (globalInfo.total_package / globalInfo.total_students).toFixed(2)
  )}</td></tr>`;

  document.getElementById("data").innerHTML = html;
}

function changeFilter(element) {
  Search = element.value;
  renderTable();
}

function changeRecruitment(element) {
  Recruitment = element.value;
  renderTable();
}

async function initial() {
  const res = await fetchData();
  renderTable();
}

initial();