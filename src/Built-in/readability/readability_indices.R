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
resultFilePath <- "results.json"
books <- c()
for (i in 1:length(filePaths)) {
    books <- c(books, readtext(filePaths[i])$text)
}
corp <- corpus(books, docnames=fileNames)    
toks <- tokens(corp, remove_punct=T)

tokensNum <- c()
for(name in fileNames) {
    tokensNum <- c(tokensNum, length(toks[[name]]))
}

features <- dfm(toks, stem=T, tolower=T)

vocabularyNum <- c()
for(i in 1:length(filePaths)) {
    vocabularyNum <- c(vocabularyNum, length(textstat_frequency(features[i])$feature))
}

result <- list()
result[["documents"]] <- fileNames
result[["TokensNum"]] <- tokensNum
result[["Vocabulary"]] <- vocabularyNum
if(!is.null(args[["readIndex"]])) {
    readIndex <- unlist(strsplit(args[["readIndex"]], split=','))
    temp <- textstat_readability(corp, measure=readIndex)
    temp[["document"]] <- NULL 
    result[["readability"]] <- temp
}
if(!is.null(args[["lexdivIndex"]])) {
    lexdivIndex <- unlist(strsplit(args[["lexdivIndex"]], split=','))
    temp <- textstat_lexdiv(toks, measure=lexdivIndex)
    temp[["document"]] <- NULL 
    result[["lexdiv"]] <- temp
}
print(toJSON(result))
write(toJSON(result), file=resultFilePath, sep=',')
