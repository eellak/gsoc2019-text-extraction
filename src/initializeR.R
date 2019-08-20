# Initialize R

# Set mirror to download packages
r <- getOption("repos")
r["CRAN"] <- "http://cran.us.r-project.org"
options(repos = r)
rm(r)

args <- commandArgs(trailingOnly=T)
# Create the environment in which R will run
.libPaths(args)
libPath <- args
if (!require("koRpus")) { install.packages('koRpus', lib=libPath) }
library("koRpus")
if(!require(koRpus.lang.en)) { install.koRpus.lang("en", lib=libPath) }
if(!require("quanteda")) { install.packages("quanteda", lib=libPath) }
if(!require("readtext")) { install.packages("readtext", lib=libPath) }
if(!require("R.utils")) { install.packages("R.utils", lib=libPath) }