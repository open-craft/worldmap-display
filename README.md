## Worldmap Display ##

This is a submission for the OpenEdX interview, part 2.

Worldmap Display is a program designed to process information into a more human readable format. This program can intake JSON, parse it dynamically, and display the information appropriately on an interactive world map. It is written in Javascript with D3 and TopoJson.

Until this project, I had never used the D3.js or TopoJson tools, and I learned a lot. Here are some key highlights:

 1. The ***world.json*** file was custom created by me. I combined country shape points and country names into one file for easier and faster processing.
 2. The program is written to dynamically handle any amount of JSON. In the example provided, I only included data for the United States, Canada, Mexico, France, and Greenland. More can be added, if so desired, and the program can handle it without any problem.
 3. The JSON data that the program processes is simply inputted as a string, but it can be changed to be received by any preferred method. The processing is agnostic to the receiving process.
 4. The map size and position can all be changed easily, depending on the final location/layout of webpage.
 5. If no JSON information is found for a particular country, the script will assign a random color gradient to that country. I included this to help better visualize what the final product will look like, and can be removed easily.
 6. I picked from my local color palette for the country gradients, and if other colors are preferred, I wrote it to be easily changeable.
 7. The drop down is populated dynamically depending on the title values in the JSON tuples. 

If anything needs to be changed, simply let me know. Thanks!