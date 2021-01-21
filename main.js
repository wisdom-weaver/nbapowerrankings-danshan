
const sheet_id = "1cUcZSRXi5ksKsHqTnQGTtWkhflNbxUpTTwaPmLv-cmk";
const sheet_no = "6";

const rankingsTable = document.querySelector('.rankings-table');

const get_sheet_url = ({ sheet_id, sheet_no }) =>
  `https://spreadsheets.google.com/feeds/list/${sheet_id}/${sheet_no}/public/values?alt=json`;

const fetch_data = (url) => {
  return new Promise((resolve, reject) => {
    return fetch(url)
      .then((resp) => resp.json())
      .then((data) => resolve(data));
  });
};

const keys_mapping = [
  {key_head: "Team",  key_final: "team", key_init: "gsx$team" },
  {key_head: "Ranking",  key_final: "ranking", key_init: "gsx$ranking" },
];

var teamData;

const structure_raw_sheet_data = (data) => {
  return (
    data?.feed?.entry.map((row) => {
      const team = row["gsx$team"].$t || "team";
      return [
        team,
        keys_mapping.reduce(
          (acc, key_pair) => ({
            ...acc,
            [key_pair.key_final]: row[key_pair.key_init]?.$t,
          }),
          {teamImg: teamData[team]?.teamImg, teamName: teamData[team]?.teamName}
        ),
      ]
    }) || []
  );
};

const generate_html = ({data}) => {
  return `<tbody>
    <tr>
      ${
        keys_mapping.map(({key_head})=> (
          `<td>${key_head}</td>`
        )).join('')
      }
    </tr>
  `+data.map(([team, data])=>(
    `<tr>
      ${
        keys_mapping.map(({key_final})=> (
          (key_final=='team' && (
            `<td>
            <div class="row-flex">
              <div class="small-logo-container">
                <img src="${data['teamImg']}" />
              </div>
              <span class="teamName">${data['team']}</span>
            </div>
            </td>`
          ))|| (
          `<td>${data[key_final]}</td>`
        ))).join(' ')
      }
    </tr>`
  )).join('')+'</tbody>'
};

const start = async () => {
  console.log("start");
  console.log(get_sheet_url({ sheet_id, sheet_no }));
  try {
    var data = await fetch_data(get_sheet_url({ sheet_id, sheet_no }));
    teamData = await fetch_data("teamData.json");

    // console.log('teamData', teamData);
    // console.log("raw", data);
    data = structure_raw_sheet_data(data);
    // console.log("structured", data);

    // const dataOb = Object.fromEntries(data);
    // console.log('dataOb', dataOb)
    var ranking_html = generate_html({data});
    rankingsTable.innerHTML = ranking_html;
  } catch (err) {
    console.log("internal fetch error", err);
  }
};

start();
