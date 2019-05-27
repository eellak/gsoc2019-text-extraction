# Initialize R
r <- getOption("repos")
r["CRAN"] <- "http://cran.us.r-project.org"
options(repos = r)
rm(r)

if(!dir.exists("Rlibrary")) dir.create("Rlibrary");

.libPaths("Rlibrary")
libPath <- "Rlibrary"
if (!require(koRpus)) { install.packages('koRpus', lib=libPath) }
if(!require(koRpus.lang.en)) { install.koRpus.lang("en", lib=libPath) }
if(!require("quanteda")) { install.packages("quanteda", lib=libPath) }
if(!require("readtext")) { install.packages("readtext", lib=libPath) }
if(!require("R.utils")) { install.packages("R.utils", lib=libPath) }