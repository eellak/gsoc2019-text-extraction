# Main program
.libPaths("Rlibrary")
libPath <- "Rlibrary"
library("koRpus")
library("koRpus.lang.en")
library("quanteda")
library("readtext")
set.kRp.env(lang="en", TT.cmd="C:\\TreeTagger\\bin\\tree-tagger.exe")
filePaths <- commandArgs(trailingOnly=T)

for (i in 1:length(filePaths)) {
    book1 <- readtext(filePaths[i])
    tagged_text <- treetag(filePaths[i], treetagger="manual", lang=get.kRp.env(lang=T), TT.options=list(path="C:\\TreeTagger", preset="en"), doc_id="sample")

    tokens <- tokens(book1$text, remove_punct=T, what="word")
    dale_chall_wordlist <- readtext("src\\daleChallWordList.txt")
    dale_chall_wordlist <- tokens(dale_chall_wordlist$text, what="word")

    read_indices <- readability(tagged_text, word.lists=list(Bormuth=dale_chall_wordlist$text1, Dale.Chall=dale_chall_wordlist$text1, Harris.Jacobson=dale_chall_wordlist$text1, Spache=dale_chall_wordlist$text1))
    print(summary(read_indices))
}