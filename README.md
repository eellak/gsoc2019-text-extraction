# :sunny: Google Summer of Code 2019 - Development of a Tool for Extracting Quantitative Text Profiles 
## About the project
Text analysis is a fascinating field that attracts people from many scientific fields. As of today, text analysis is executed through powerful scripts, scattered to many packages and libraries of different programming languages, each of which contains only a subset of available linguistic features and requires high technical knowledge to be operated. As a result, it is difficult to obtain a unified result, with all the desired features and many people, who lack a computer science background, are excluded from using them.

The goal of the project is to build a desktop GUI, that provides its users with an easy way to extract quantitative text profiles from multilingual texts. The text analysis will come from scripts that combine many existing NLP packages, written in R. The tool is going to be modular and open source, in order to be easily accessible and adaptable to everyone's needs. The project is going to boost and facilitate scientific research in NLP fields, as it will make text analysis available to people with little to none computer science knowledge, such as linguistics students.

This project is one of the projects that got accepted for the 2019 session of the [Google Summer of Code](https://summerofcode.withgoogle.com/about/). The final report, which includes a summary of the work that was done during the program, can be found [here](https://gist.github.com/PanagiotisP/568c028e3ca53431aa852afe4cc7b2e9).

## Project Timeline
The timeline of the development must comply with the official GSoC [timeline](https://summerofcode.withgoogle.com/how-it-works/#timeline) and is the following:

* Community Bonding (May 6 - May 26)
  * Meet with my mentors and discuss about the project's architecture and implementation details.
  * Get familiar with the tools and packages that are going to be used.

* Coding - 1st Phase (May 27 - June 28)
  * Choose the necessary NLP packages and functions based on their usability and accuracy.
  * Code the NLP scripts, using already implemented functions and ensure their compatibility.
  * Design GUI's layout and implement a simple, prototype GUI to test the above scripts. 

* Coding - 2nd Phase (June 29 - July 26)
  * Design the database.
  * Develop a REST API for frontend - backend communication.
  * Continue working on GUI.

* Coding - 3rd Phase (July 27 - August 26)
  * Add export and visualization options.
  * Test the application with real users and adapt to the feedback

## Execution
Instructions on how to install and operate the application can be found at the relevant [wiki page](https://github.com/eellak/gsoc2019-text-extraction/wiki/Installation-and-Operation).

To run the application in development mode, firstly install the necessary npm package, by executing

```npm install```
 at the project's directory. Then run with

```npm run electron-dev```

This will run reactJS on port 3000, but instead of opening it in a browser, an electron window will open, hosting is.

## Demo
The performance of the processing is good enough, although there are many changes that can be done to improve it. Below is an example of calculating all of the currently supported indices on 24 files of 10MB total size (RAM peaked at ~1800 MB).
![performance](https://github.com/eellak/gsoc2019-text-extraction/blob/master/doc_images/performance.png "Performance demonstration")
## Future Work
The application at the current state can be considered to be in alpha version. As such, it is expected to have many bugs and many areas for improvement. Some future enhancements that can be done are the following:

 1. Adopt Typescript
 2. Improve performance
 3. Add more indices
 4. Add workspaces
 5. Improve appearance
 
 A full list of planned features and future work can be found [here](https://github.com/eellak/gsoc2019-text-extraction/wiki/Future-Work).

## Contributors
 * Mentor: Leventis Sotiris ([sotirisleventis](https://github.com/sotirisleventis))
 * Mentor: Mikros George ([gmikros](https://github.com/gmikros))
 * Mentor: Fitsilis Fotis ([fitsilisf](https://github.com/fitsilisf))
 * Google Summer of Code 2019 Participant: Papantonakis Panagiotis ([PanagiotisP](https://github.com/PanagiotisP))
  
