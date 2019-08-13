# Load necessary packages
args <- commandArgs(trailingOnly=T)
.libPaths(args[1])
libPath <- args[1]
library("R.utils")
library("quanteda")
library("readtext")
library("jsonlite")

# Get and split commandArgs (paths of the files to process and readability indices)
args <- commandArgs(trailingOnly=T, asValues=T)
filePaths <- unlist(strsplit(args[["filePaths"]], split=','));

fileNames <- basename(filePaths)
resultFilePath <- "temp\\results_readability.json"
books <- c()
for (i in 1:length(filePaths)) {
    books <- c(books, readtext(filePaths[i])$text)
}
corp <- corpus(books, docnames=fileNames)    

result <- list()
# result[["fileNames"]] <- fileNames
result[["filePaths"]] <- filePaths
if(!is.null(args[["index"]])) {
    readIndex <- unlist(strsplit(args[["index"]], split=','))
    temp <- textstat_readability(corp, measure=readIndex)
    temp[["document"]] <- NULL 
    result[["readability"]] <- temp
}
write(toJSON(result), file=resultFilePath, sep=',')
print("add book")
