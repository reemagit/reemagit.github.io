
function buildMasterMenu() {
  let masterMenuHtml = '<table class="table table-bordered"><thead><tr><th scope="col">Day</th><th scope="col">Lunch</th><th scope="col">Dinner</th></tr></thead><tbody>';

  data.masterMenu.forEach(dayMenu => {
    masterMenuHtml += `<tr><th scope="row">${dayMenu.day}</th><td>${dayMenu.lunch}</td><td>${dayMenu.dinner}</td></tr>`;
  });

  masterMenuHtml += '</tbody></table>';
  document.getElementById('master-menu').innerHTML = masterMenuHtml;
}

function buildWeeklyMenu() {
  let weeklyMenuHtml = '<table class="table table-bordered"><thead><tr><th scope="col">Day</th><th scope="col">Lunch</th><th scope="col">Dinner</th></tr></thead><tbody>';

  data.masterMenu.forEach(dayMenu => {
    const lunchOptions = data.recipes
      .filter(recipe => recipe.category === dayMenu.lunch)
      .map(recipe => `<option value="${recipe.name}">${recipe.name}</option>`)
      .join('');

    const dinnerOptions = data.recipes
      .filter(recipe => recipe.category === dayMenu.dinner)
      .map(recipe => `<option value="${recipe.name}">${recipe.name}</option>`)
      .join('');

    weeklyMenuHtml += `<tr><th scope="row">${dayMenu.day}</th><td><select class="custom-select">${lunchOptions}</select></td><td><select class="custom-select">${dinnerOptions}</select></td></tr>`;
  });

  weeklyMenuHtml += '</tbody></table>';
  document.getElementById('weekly-menu').innerHTML = weeklyMenuHtml;
  document.getElementById('generate-menu-tab').addEventListener('click', generateMenuAndSave);
}

function generateMenuAndSave() {
  const generatedMenu = [];
  const tableRows = document.querySelectorAll('#weekly-menu tbody tr');
  
  tableRows.forEach(row => {
    const day = row.querySelector('th').innerText;
    const lunch = row.querySelectorAll('td:nth-child(2) select')[0].value;
    const dinner = row.querySelectorAll('td:nth-child(3) select')[0].value;
    generatedMenu.push({ day, lunch, dinner });
  });

  localStorage.setItem('generatedMenu', JSON.stringify(generatedMenu));
  buildGeneratedMenu(generatedMenu);
}

function buildGeneratedMenu(menuData) {
  let generatedMenuHtml = '<table class="table table-bordered"><thead><tr><th scope="col">Day</th><th scope="col">Lunch</th><th scope="col">Dinner</th></tr></thead><tbody>';

  menuData.forEach(dayMenu => {
    generatedMenuHtml += `<tr><th scope="row">${dayMenu.day}</th><td>${dayMenu.lunch}</td><td>${dayMenu.dinner}</td></tr>`;
  });

  generatedMenuHtml += '</tbody></table>';
  document.getElementById('generated-menu').innerHTML = generatedMenuHtml;

  // Calculate and display the list of ingredients
  const ingredients = {};

  menuData.forEach(dayMenu => {
    [dayMenu.lunch, dayMenu.dinner].forEach((mealName, index) => {
      const mealType = index === 0 ? 'Lunch' : 'Dinner';
      const recipe = data.recipes.find(recipe => recipe.name === mealName);
      recipe.ingredients.forEach(ingredient => {
        if (ingredients[ingredient.name]) {
          ingredients[ingredient.name].count += 1;
          ingredients[ingredient.name].meals.push(`${mealName} (${dayMenu.day} ${mealType})`);
        } else {
          ingredients[ingredient.name] = {
            count: 1,
            meals: [`${mealName} (${dayMenu.day} ${mealType})`],
          };
        }
      });
    });
  });

  let ingredientsHtml = '<h2 class="mt-4" id="shoplist-title">Shopping List</h2><div class="accordion" id="ingredientsAccordion">';
  let ingredientIndex = 0;
  for (const [ingredient, details] of Object.entries(ingredients)) {
    ingredientsHtml += `
      <div class="card" style="border: none;">
        <div class="card-header" id="heading${ingredientIndex}" data-toggle="collapse" data-target="#collapse${ingredientIndex}" aria-expanded="true" aria-controls="collapse${ingredientIndex}" style="cursor: pointer; padding: 0;">
          <table class="table table-bordered table-hover table-sm mb-0" style="background-color: white;">
            <tbody>
              <tr>
                <td class="pl-3">${ingredient}: ${details.count} meals</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div id="collapse${ingredientIndex}" class="collapse" aria-labelledby="heading${ingredientIndex}" data-parent="#ingredientsAccordion">
          <div class="card-body">
            <ul>`;
    details.meals.forEach(meal => {
      ingredientsHtml += `<li>${meal}</li>`;
    });
    ingredientsHtml += `
            </ul>
          </div>
        </div>
      </div>`;
    ingredientIndex += 1;
  }
  ingredientsHtml += '</div>';
  document.getElementById('generated-menu').innerHTML += ingredientsHtml;

  // Add click event listeners to card headers
  const cardHeaders = document.querySelectorAll('#ingredientsAccordion .card-header');
  cardHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const collapseElementId = header.getAttribute('data-target');
      const collapseElement = document.querySelector(collapseElementId);
      collapseElement.classList.toggle('collapse');
    });
  });
}


$(document).ready(function () {
  buildMasterMenu();
  buildWeeklyMenu();
  const savedMenu = localStorage.getItem('generatedMenu');
  if (savedMenu) {
    buildGeneratedMenu(JSON.parse(savedMenu));
  }
});