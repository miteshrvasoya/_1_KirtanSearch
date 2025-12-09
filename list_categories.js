import { master_json_data } from "./src/utils/master_data.js";

console.log("Categories found in master_data.js:");
master_json_data.forEach(category => {
    console.log(`ID: ${category.id}, Name: ${category.name}, EnName: ${category.en_name}`);
});
