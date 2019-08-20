
# Load necessary packages
args <- commandArgs(trailingOnly=T)
.libPaths(args[1])
libPath <- args[1]
library("R.utils")
# library("koRpus")
# library("koRpus.lang.en")
library("quanteda")
library("readtext")
library("jsonlite")

# set.kRp.env(lang="en", TT.options=list(path="C:\\TreeTagger", preset="en"))


# Get and split commandArgs (paths of the files to process and readability indices)
args <- commandArgs(trailingOnly=T, asValues=T)
filePaths <- unlist(strsplit(args[["filePaths"]], split=','));
indices <- unlist(strsplit(args[["index"]], split=','));
fileNames <- basename(filePaths)
resultFilePath <- "temp\\results_misc.json"

result <- list()
# result[["fileNames"]] <- fileNames
result[["filePaths"]] <- filePaths
tokensList <- list()
tokensNumList <- list()
vocabularyList <- list()
vocabularyNumList <- list()
entropyList <- c()
normentropyList <- c()
for (k in 1:length(filePaths)) {

    book <- readtext(filePaths[k])$text
    corp <- corpus(book, docnames=fileNames[k])    
    toks <- quanteda::tokens(corp, remove_punct=T, remove_twitter=T)
    TOKENS_LIST <- toks[[fileNames[k]]]
    TOKENS <- length(TOKENS_LIST)
    N <- length(TOKENS_LIST)

    features <- dfm(toks, stem=T, tolower=T)
    features <- dfm_select(features, pattern=".+\\..+", selection="remove", valuetype="regex")
    TYPES_LIST <- featnames(features[1, colSums(features[1] != 0) > 0])
    TYPES <- length(TYPES_LIST)
    V <- length(TYPES_LIST)

    freq_analysis <- textstat_frequency(features)
    # a <- tokenize(TYPES_LIST, format="obj", tag=F, lang=get.kRp.env(lang=T), split="\\ ")
    # tagged_text <- treetag(TYPES_LIST, treetagger="manual", format="obj", lang=get.kRp.env(lang=T), TT.options=get.kRp.env(TT.options=T), doc_id=fileNames[k])

    AvgRank = freq_analysis$rank
    TYPE = freq_analysis$feature
    # POS = tagged_text@TT.res$tag
    Frequency = freq_analysis$frequency

    F <- Frequency
    ## INDICES    #######################################################################################
    ## Globals: TOKENS    or N    ... tokens count
    ##            TYPES    or V    ... types count
    ##            TOKENS_LIST        ... list of tokens
    ##            TYPES_LIST        ... list of types
    ##            FREQ_TABLE        ... table of $AvgRank, $Type, $POS, $Frequency for token, sorted by frequency
    ##            F                 ... FREQ_TABLE$Frequency
    ##            H                ... h-Point
    ##            hasPOSTags        ... true/false, indicates whether POS tags list is available
    ##            place()            ... places index result in the order, not alphabetically.
    ##-------------------------------------------------------------------------------------------------

    TOKENS_LENGTHS                <- sapply( TOKENS_LIST, function(x) nchar(x, type="char"))

    INDEX_TOKENS_INT            <- as.integer(TOKENS)
    # INDEX_TOKENS_INT            <- place(INDEX_TOKENS_INT)

    INDEX_TOKENS_EXT            <- as.data.frame(cbind(1:N, TOKENS_LIST), stringsAsFactors = FALSE)
    INDEX_TOKENS_EXT            <- as.data.frame(INDEX_TOKENS_EXT)
    colnames(INDEX_TOKENS_EXT)    <- c("Index", "Token")

    INDEX_TYPES_INT            <- as.integer(TYPES)
    # INDEX_TYPES_INT            <- place(INDEX_TYPES_INT)
    # INDEX_TYPES_EXT            <- FREQ_TABLE #TYPES_LIST

    INDEX_TTR                <- TYPES / TOKENS;
    # INDEX_TTR                <- place(INDEX_TTR)

    INDEX_ENTROPY            <- -sum( (F/N)*log2(F/N) )
    # INDEX_ENTROPY            <- place(INDEX_ENTROPY)

    INDEX_NORMENTROPY        <- -sum( (F/N)*log(F/N, V) )
    # INDEX_NORMENTROPY        <- place(INDEX_NORMENTROPY)

    INDEX_AVGTOKENLEN        <- mean(TOKENS_LENGTHS)
    # INDEX_AVGTOKENLEN        <- place(INDEX_AVGTOKENLEN)

    INDEX_TOKENLENSD        <- sd(TOKENS_LENGTHS)
    # INDEX_TOKENLENSD        <- place(INDEX_TOKENLENSD)

    INDEX_HAPAXPERCENTAGE    <- length( which(F == 1) ) / N
    # INDEX_HAPAXPERCENTAGE    <- place(INDEX_HAPAXPERCENTAGE)

    INDEX_PARATIO            <- sum( F[1:round(V*0.20)] ) / N

    ###################################################################################################
    ##    h-Point

    INDEX_H <- 0
    borderFound <- FALSE

    for(r in 1:V){
        if (r == F[r]){
            INDEX_H    <- r
            break;
        }
        if (r > F[r]){
            borderFound <- TRUE
            r            <- r-1
            break;
        }
    }

    if (borderFound){
        i <- r
        j <- r + 1
        
        INDEX_H <- ( (F[i] * j) - (F[j] * i) ) / (j - i + F[i] - F[j])
    }

    H        <- INDEX_H
    # INDEX_H    <- place(INDEX_H)

    ###################################################################################################
    ## LAMBDA

    # L <- doSum2(FREQ_TABLE$Frequency, 
    #             1, 
    #             V-1, 
    #             function(i,e,a) sqrt( (a[i] - a[i+1] )^2 + 1  ) )
                            
    # INDEX_LAMBDA<- (L * log10(N)) / N

    ###################################################################################################
    ## GINIS COEFFICIENT

    # m1 <- doSum2(FREQ_TABLE$Frequency, 1, V, function(i,e,a) (i * e)) / N
    # INDEX_GINISCOEF     <- (1 / V) * ( (V + 1) - (2 * m1) )
    # INDEX_GINISCOEFR4    <- 1 - INDEX_GINISCOEF

    ###################################################################################################
    ## REPEAT RATE, RR MC

    # fI <- doSum(FREQ_TABLE$Frequency, function(i,e,a) e^2  )
    # INDEX_RR    <- fI / (N ^ 2)
    # INDEX_RRMC     <-  (1 - sqrt(INDEX_RR)) / (1 - (1 / sqrt(V)))

    ###################################################################################################
    ## R1

    # INDEX_R1 <- NaN

    # fH <- doSum2(F, 1, H, function(i,e,a) e ) / N
    # INDEX_R1 <- 1 - (fH - ((H ^ 2) / (2 * N)))

    ###################################################################################################
    ## ADJUSTED MODULUS

    M <- (1 / H) * sqrt((F[1] ^ 2 + V ^ 2))
    INDEX_ADJUSTEDMODULUS <- M / log10(N)

    ###################################################################################################
    ## YULES K
    M1 <- N
    M2 <- sum( F ** 2 )
    INDEX_YULESK <- 10000 * (M2-M1)/(M1**2)

    ###################################################################################################
    ## Token Lengths Frequency Spectrum

    TLFS <- table( factor(TOKENS_LENGTHS,lev=1:max(TOKENS_LENGTHS)) ) 
    INDEX_TLFS_INT <-sum( TLFS != 0)
    INDEX_TLFS_EXT <- as.data.frame(TLFS)
    names(INDEX_TLFS_EXT)    <- c("Token Length", "Frequency")

    ###################################################################################################
    ## L

    # INDEX_L    <- doSum2(FREQ_TABLE$Frequency, 1, V-1, function(i,e,a)
    #                                                     (sqrt((a[i] - a[i + 1]) ^ 2 + 1)))

    ###################################################################################################
    ## WrittersView

    f1                    <- F[1]
    cosAlpha            <- (-(((H - 1) * (f1 - H)) + ((H - 1) * (V - H)))) / ( sqrt( (H - 1)^2 + (f1 - H)^2 ) * sqrt( (H - 1)^2 + (V - H)^2) )
    INDEX_WRITTERSVIEW    <- acos(cosAlpha)

    ###################################################################################################
    ## Curve Length RIndex
    # Lh    <- NaN
    # h    <- round(H)

    # if (isWholeNumber(H)){
    #     if (H == V){    #When h point is at the end
    #         Lh <- doSum2(F, 1, H - 1, function(r,f,a) sqrt( (f - a[r + 1]) ^ 2 + 1) )
    #     }else{            #h point is at normal rank.
    #         Lh <- doSum2(F, 1, H, function(r,f,a) sqrt((f - a[r + 1]) ^ 2 + 1))
    #     }
    # }else{
    #     Lh <- doSum2(F, 1, h - 1, function(r,f,a) sqrt( (f-a[r+1])^2 + 1) )
    #     Lh <- Lh + sqrt((H - F[h]) ^ 2 + (H - h) ^ 2)
    # }

    # CL <- doSum2(F, h + 1, V - 1, function(i,e,a)  (sqrt((e - F[r+1]) ^ 2 + 1)))

    # INDEX_RINDEX <- 1 - (Lh / INDEX_L)

    ###################################################################################################
    ## POS Frequency

    # if (hasPOSTags){
    #     INDEX_POS_FREQUENCY_EXT            <- table(TOKENS_POS_LIST)
    #     names(INDEX_POS_FREQUENCY_EXT)    <- c("POS", "Frequency")
        
    #     INDEX_POS_FREQUENCY_INT            <- nrow(INDEX_POS_FREQUENCY_EXT)
    # }

    ###################################################################################################
    ## Activity & Descriptivity

    # if (hasPOSTags){
    #     INDEX_ACTIVITY_EXT        <- matrix(0, ncol=5, TOKENS)
    #     INDEX_DESCRIPTIVITY_EXT    <- matrix(0, ncol=5, TOKENS)
        
    #     verbCount    <- 0
    #     adjCount    <- 0
    #     descQ        <- NaN
    #     actQ        <- NaN
    #     j            <- 0
        
    #     for (i in 1:N){
    #         token    <- FREQ_TABLE$Type[i]
    #         pos        <- FREQ_TABLE$POS[i]
    #         isGood    <- FALSE
            
    #         if (isWordMeaningfull(token)){
    #             if (isPOSVerb(pos)){
    #                 verbCount    <- verbCount+1
    #                 isGood        <- TRUE
    #             }
                
    #             if (isPOSAdjective(pos)){
    #                 adjCount    <- adjCount+1
    #                 isGood        <- TRUE
    #             }
                
    #             if (isGood){
    #                 descQ    <- adjCount / (verbCount + adjCount)
    #                 actQ    <- verbCount / (verbCount + adjCount)
                    
    #                 if (allowExts){
    #                     INDEX_ACTIVITY_EXT[j,]        <- c(verbCount+adjCount, actQ,  token, verbCount, adjCount)
    #                     INDEX_DESCRIPTIVITY_EXT[j,]    <- c(verbCount+adjCount, descQ, token, verbCount, adjCount)
    #                 }
                    
    #                 j        <- j+1
    #             }
    #         }
    #     }
        
    #     INDEX_ACTIVITY_EXT        <- as.data.frame(rbind(INDEX_ACTIVITY_EXT[-c(j:N), ]))
    #     INDEX_DESCRIPTIVITY_EXT    <- as.data.frame(rbind(INDEX_DESCRIPTIVITY_EXT[-c(j:N), ]))
        
    #     colnames(INDEX_ACTIVITY_EXT)        <- c("V+A", "Activity Q", "Token", "VerbCount", "AdjectiveCount")
    #     colnames(INDEX_DESCRIPTIVITY_EXT)    <- c("V+A", "Descriptivity Q", "Token", "VerbCount", "AdjectiveCount")
        
    #     INDEX_DESCRIPTIVITY        <- descQ
    #     INDEX_ACTIVITY            <- actQ
        
    #     # INDEX_ACTIVITY            <- place(INDEX_ACTIVITY)
    #     # INDEX_DESCRIPTIVITY        <- place(INDEX_DESCRIPTIVITY)
    # }

    ###################################################################################################
    ## TC

    # if (hasPOSTags)
    # {
    #     TCTab    <- matrix(0, ncol=7, TOKENS)
    #     i        <- 1
    #     INDEX_TC<- 0
        
    #     for(r in 1:V)
    #     {
    #         if (FREQ_TABLE$AvgRank[r] >= H){
    #             break
    #         }
            
    #         token    <- FREQ_TABLE$Type[r]
    #         pos        <- FREQ_TABLE$POS[r]
            
    #         if (isPOSVerb(pos) || isPOSAdjective(pos) || isPOSNoun(pos))
    #         {
    #             if (isWordMeaningfull(token))
    #             {
    #                 ra            <- FREQ_TABLE$AvgRank[r]
    #                 TW            <- 2 * ((H - ra) * F[r]) / (H * (H - 1) * F[1])
    #                 INDEX_TC    <- INDEX_TC + TW
                    
    #                 TCTab[i,]    <- c(i, r, ra, F[r], token, pos, TW)
                    
    #                 i            <- i+1
    #             }
    #         }
    #     }
        
    #     # INDEX_TC                <- place(INDEX_TC)
    #     INDEX_TC_EXT            <- as.data.frame(rbind(TCTab[-c(i:N),]))
    #     colnames(INDEX_TC_EXT)    <- c("#", "Rank", "AvgRank", "Frequency", "Token", "POS", "TW")
    # }

    ###################################################################################################
    ## STC

    # if (hasPOSTags)
    # {
    #     TCTab        <- matrix(0, ncol=7, TOKENS)
    #     i            <- 1
    #     INDEX_STC    <- 0
        
    #     for(r in 1:V)
    #     {
    #         if (FREQ_TABLE$AvgRank[r] >= 2*H){
    #             break
    #         }
            
    #         token    <- FREQ_TABLE$Type[r]
    #         pos        <- FREQ_TABLE$POS[r]
            
    #         if (isPOSVerb(pos) || isPOSAdjective(pos) || isPOSNoun(pos))
    #         {
    #             if (isWordMeaningfull(token))
    #             {
    #                 ra            <- FREQ_TABLE$AvgRank[r]
    #                 TW            <- (2*H - ra) * F[r] / (H * (2*H - 1) * F[1])
    #                 INDEX_STC    <- INDEX_STC + TW
                    
    #                 TCTab[i,]    <- c(i, r, ra, F[r], token, pos, TW)
                    
    #                 i <- i+1
    #             }
    #         }
    #     }
        
    #     # INDEX_STC                <- place(INDEX_STC)
    #     INDEX_STC_EXT            <- as.data.frame(rbind(TCTab[-c(i:N),]))
    #     colnames(INDEX_STC_EXT)    <- c("#", "Rank", "AvgRank", "Frequency", "Token", "POS", "TW")
    # }

    ###################################################################################################
    ## PTC

    # if (hasPOSTags)
    # {
    #     TCTab        <- matrix(0, ncol=7, TOKENS)
    #     i            <- 1
    #     INDEX_PTC    <- 0
        
    #     for(r in 1:V)
    #     {
    #         if (FREQ_TABLE$AvgRank[r] >= H){
    #             break
    #         }
            
    #         token    <- FREQ_TABLE$Type[r]
    #         pos        <- FREQ_TABLE$POS[r]
            
    #         if (isPOSVerb(pos) || isPOSAdjective(pos) || isPOSNoun(pos))
    #         {
    #             if (isWordMeaningfull(token))
    #             {
    #                 ra            <- FREQ_TABLE$AvgRank[r]
    #                 TW            <- F[r]
    #                 INDEX_PTC    <- INDEX_PTC + TW

    #                 TCTab[i,]    <- c(i, r, ra, F[r], token, pos, TW)
                    
    #                 i <- i+1
    #             }
    #         }
    #     }
        
    #     Nh <- 0
        
    #     for(r in 1:V)
    #     {
    #         if (FREQ_TABLE$AvgRank[r] >= H){
    #             break
    #         }

    #         Nh <- Nh + F[r]
    #     }

    #     INDEX_PTC <- (1 / Nh) * INDEX_PTC
        
    #     # INDEX_PTC                <- place(INDEX_PTC)
    #     INDEX_PTC_EXT            <- as.data.frame(rbind(TCTab[-c(i:N),]))
    #     colnames(INDEX_PTC_EXT)    <- c("#", "Rank", "AvgRank", "Frequency", "Token", "POS", "TW")
    # }


    tokensList[[k]] <- TOKENS_LIST
    tokensNumList[[k]] <- TOKENS
    vocabularyList[[k]] <- TYPES_LIST
    vocabularyNumList[[k]] <- TYPES
    entropyList<- c(entropyList, INDEX_ENTROPY)
    normentropyList <- c(normentropyList, INDEX_NORMENTROPY)
}
    temp <- data.frame(
        entropy=entropyList,
        normentropy=normentropyList
    )
    # if(is.element("entropy", indices)) {
    #     temp[["entropy"]] <- entropyList
    # }
    # if(is.element("normentropy", indices)) {
    #     temp[["normentropy"]] <- normentropyList
    # }
    if(is.element("tokens", indices)) {
        result[["tokens"]] <- tokensList
        result[["tokensNum"]] <- tokensNumList
    }
    if(is.element("vocabulary", indices)) {
        result[["vocabulary"]] <- vocabularyList
        result[["vocabularyNum"]] <- vocabularyNumList
    }
    result[["misc"]] <- temp;
    write(toJSON(result), file=resultFilePath, sep=',')
    print("add book")
