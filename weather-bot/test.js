var fields = "";
        

var genres = ["een", "twee", "drie"];

for (i = 0; i < genres.length; i++) { 
        fields += 
        `{ "title": "Artiest: ", "value": "` + genres[i] + `", "short": "false" }, { "title": "Artiest: ", "value": "` + genres[i] + `", "short": "false" }, `;
}

console.log(fields);