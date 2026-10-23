const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname)));

const rooms = {};

const promptPairs = [
    { real: "At what age does the average person first fall in love?", imposter: "At what age does the average person get their driver's license?" },
    { real: "How do you celebrate finishing a long, hard work week?", imposter: "What is your favorite lazy day activity?" },
    { real: "How long could you survive in the woods living off only what is there?", imposter: "How long could you serve in prison before breaking down and crying?" },
    { real: "How long do you spend scrolling on your phone before sleep?", imposter: "How long should it take to poop?" },
    { real: "How long does it take you to get out of bed after you wake up?", imposter: "How long does it take you to fall asleep?" },
    { real: "How long should a good wedding reception last?", imposter: "How long should a work day be?" },
    { real: "How many days could you survive without the internet?", imposter: "How many days in a row could you eat nothing but hot dogs if each day gets you 1000 dollars?" },
    { real: "How many days in a row could you eat nothing but hot dogs if each day gets you $1000?", imposter: "How many days a month do you eat fast food?" },
    { real: "How many hours a week do you spend being physically active?", imposter: "How many hours a week do you spend cooking?" },
    { real: "How many hours have you gone without talking while being awake?", imposter: "What is the longest plane ride you have been on?" },
    { real: "How many marshmallows can you fit in your mouth?", imposter: "How many keys are on your keychain?" },
    { real: "How many miles could you walk in one day if your life depended on it?", imposter: "What is the longest hike or walk you've ever completed in a day?" },
    { real: "How many minutes does the average person take to run a mile?", imposter: "How many minutes does it take to shower?" },
    { real: "How many songs are in your favorite playlist?", imposter: "How many songs does Taylor Swift have about her ex boyfriends?" },
    { real: "How much is the most expensive restaurant check you have paid?", imposter: "How much would you pay to see your favorite artist or athlete's final performance?" },
    { real: "How much money do you save each month?", imposter: "How much money do you waste each month?" },
    { real: "How much money would it take for you to eat a dog?", imposter: "How much money would it take to tattoo a stranger's lips on your butt?" },
    { real: "How much should you spend on a first date?", imposter: "How much money per day does the average person make?" },
    { real: "How would your best friend describe you in three words?", imposter: "How would your worst enemy describe you in 3 words?" },
    { real: "If someone is showing you a video on their phone what is the max length it should be?", imposter: "How long can you hold your breath under water?" },
    { real: "If you could add a 13th month to the calendar, what would you name it?", imposter: "If you discovered a star, what would you name it?" },
    { real: "If you could build a secret room in your house, what would be inside it?", imposter: "What is the first thing you would add to a game room in your house?" },
    { real: "If you could change your name to anything, what would you pick?", imposter: "What is the dumbest baby name you have heard?" },
    { real: "If you could choose an age to stay at forever, what age would you pick?", imposter: "What age was the most awkward stage of your life?" },
    { real: "If you could choose how you die, what would your ideal scenario be?", imposter: "What is the most absurd way someone could accidentally die?" },
    { real: "If you could commit any crime legally once what would it be?", imposter: "What is a law that you have broken?" },
    { real: "If you could control the weather for just one day, what would you make happen?", imposter: "What type of weather is the worst?" },
    { real: "If you could create a new federal holiday, what would it celebrate?", imposter: "What celebrity deserves their own holiday?" },
    { real: "If you could design a new flavor of ice cream, what would be in it?", imposter: "What is the worst 2 flavor combos?" },
    { real: "If you could design a new theme park, what is the theme?", imposter: "What is the most popular movie or tv show of all time?" },
    { real: "If you could eat dinner with any historical figure, who would it be?", imposter: "What historical figure was probably terrible at dinner parties?" },
    { real: "If you could give everyone in the world one piece of advice, what would it be?", imposter: "What terrible advice do people keep giving out?" },
    { real: "If you could have a robot butler do one specific task for you, what would it do?", imposter: "What household chore needs to be done the most?" },
    { real: "If you could have an unlimited supply of one cheap item, what would it be?", imposter: "What food can you never get enough of?" },
    { real: "If you could have any superpower, what would it be?", imposter: "What is the most useless superpower you can think of?" },
    { real: "If you could improve one thing about yourself, what would it be?", imposter: "If you had to choose the best thing about yourself, what would it be?" },
    { real: "If you could instantly master any instrument, which one would you pick?", imposter: "What instrument makes the worst sound when played badly?" },
    { real: "If you could instantly speak every language fluently, where would you go first?", imposter: "What language sounds the most confusing to learn?" },
    { real: "If you could instantly teleport anywhere right now, where would you land?", imposter: "Where is the last place you'd ever want to teleport to?" },
    { real: "If you could live in a TV show what would it be?", imposter: "What is your favorite TV show ever?" },
    { real: "If you could master any professional trade, what would you pick?", imposter: "What professional trade would you never attempt to do on your own?" },
    { real: "If you could move to another country what would it be?", imposter: "What is the best country to visit but not to live?" },
    { real: "If you could pause time for 1 hour, what would you do?", imposter: "What crime would you commit if you knew you could get away with it?" },
    { real: "If you could permanently ban one food ingredient from the world, what would it be?", imposter: "What food ingredient do people put way too much of in dishes?" },
    { real: "If you could plant a tree that grew anything, what would you want it to grow?", imposter: "What food is the most delicious?" },
    { real: "If you could read minds, what would you not want someone to think about?", imposter: "What is an inappropriate thought that most people probably have?" },
    { real: "If you could show 1 modern invention to someone 500 years ago what would it be?", imposter: "If you could show 1 modern invention to someone 500 years in the future what would it be?" },
    { real: "If you could squirt a liquid out of your finger to drink, what would be the craziest choice?", imposter: "What drink do you like that most people don’t drink?" },
    { real: "If you could start your own country what would be your first rule?", imposter: "What is the best law?" },
    { real: "If you could swap lives with any fictional character for a week, who would it be?", imposter: "Which fictional character would struggle the most in the real world?" },
    { real: "If you could talk to animals, what animal would you want to talk to first?", imposter: "What animal is the most annoying?" },
    { real: "If you could travel to any point in the past, where would you go?", imposter: "What time period in history would be the worst to live in?" },
    { real: "If you could turn any animal into a household pet, what would it be?", imposter: "What animal would make the worst roommate?" },
    { real: "If you had to eat only one food item for the rest of your life, what would it be?", imposter: "What food item would you ban from existence forever?" },
    { real: "If you had to fight one celebrity, who would you pick?", imposter: "Which female celebrity is underrated?" },
    { real: "If you had to spend a year stranded on a desert island, what 3 items would you bring?", imposter: "What 3 items would you die without?" },
    { real: "If you had to star in a movie genre, which one would you pick?", imposter: "What movie genre do you always fall asleep during?" },
    { real: "If you had to teach a college class on one topic tomorrow, what would it be?", imposter: "What subject did you like that most people don’t?" },
    { real: "If you had to wear one color for the rest of your life, what would it be?", imposter: "What color clothing looks the worst on you?" },
    { real: "If you woke up tomorrow as the opposite gender, what is the first thing you'd do?", imposter: "If you were the opposite gender, what celebrity would you have a crush on?" },
    { real: "If you won a million dollars tomorrow, what is the very first thing you'd buy?", imposter: "If you were flat broke tomorrow, what is the first thing you'd sell?" },
    { real: "If your house was burning down, what 1 object would you run back in to grab?", imposter: "What item in your room has the most value?" },
    { real: "If your personality was a color, what color would it be?", imposter: "What color matches your mood right now?" },
    { real: "Rate your athletic ability from 1 to 10.", imposter: "How many kids would you have if money was not an issue?" },
    { real: "Rate your work ethic 1-10.", imposter: "Rate your fitness level 1-10." },
    { real: "What 2 colors look the best on an athletic jersey?", imposter: "What 2 colors look awful together?" },
    { real: "What actor ruins every movie they are in?", imposter: "What actor instantly makes you want to watch a movie?" },
    { real: "What advice would you give your 10 year old self?", imposter: "What is the last good advice you heard?" },
    { real: "What age is the most exciting birthday?", imposter: "What age are you afraid to turn?" },
    { real: "What age should you get your first phone?", imposter: "What age did you get your first phone?" },
    { real: "What AI tool do you use the most?", imposter: "What AI tool is wrong the most?" },
    { real: "What amusement park or water park is the best?", imposter: "What amusement park or water park have you never been to?" },
    { real: "What animal is the most similar to you?", imposter: "What animal do you not want to be compared to?" },
    { real: "What are the 2 worst ingredients to put in a smoothie?", imposter: "What are the 2 most random ingredients to put in a smoothie that might still be okay?" },
    { real: "What athlete do you wish you could meet?", imposter: "Who was the first athlete you ever saw in person?" },
    { real: "What bakery item is worth every single calorie?", imposter: "What pastry looks delicious but tastes dry?" },
    { real: "What band would you pay top dollar to see play?", imposter: "What legendary music group do you think is totally overrated?" },
    { real: "What board game adaptation would make a terrible movie?", imposter: "What board game do a lot of people love?" },
    { real: "What board or card game are you secretly the best at?", imposter: "What board or card game is overhyped?" },
    { real: "What book changed your perspective on life?", imposter: "What assigned school reading did you completely fake reading?" },
    { real: "What book series did you like as a kid?", imposter: "What childhood book series did you never get into?" },
    { real: "What boundary should people never cross in an argument?", imposter: "Name a karate move to use and a body part to attack" },
    { real: "What brand has the best marketing team?", imposter: "What company spends the most money on ads but they are all terrible?" },
    { real: "What breakfast food is better for dinner than morning?", imposter: "What breakfast item takes too long to make?" },
    { real: "What camping essential can you not live without?", imposter: "What luxury item do you pack when traveling?" },
    { real: "What car technology do you consider essential?", imposter: "What car feature is completely unnecessary?" },
    { real: "What cartoon from your childhood do you wish was still on TV?", imposter: "What childhood cartoon did you hate?" },
    { real: "What cereal was your favorite as a kid?", imposter: "What cereal has the most sugar?" },
    { real: "What character do you relate to on a spiritual level?", imposter: "What character makes poor life choices?" },
    { real: "What childhood game was the most fun?", imposter: "What popular childhood game was actually awful?" },
    { real: "What childhood nickname did you have?", imposter: "Give yourself a crazy nickname right now." },
    { real: "What city in the world do you want to explore?", imposter: "What city in the world has the most problems?" },
    { real: "What color represents math?", imposter: "What is your favorite color?" },
    { real: "What company would you want to be the CEO of?", imposter: "What company is the most evil?" },
    { real: "What dance looks the coolest?", imposter: "What dance would you be able to learn the fastest?" },
    { real: "What digital subscription do you pay for?", imposter: "What digital subscription do you regret paying for?" },
    { real: "What Disney character do you never let babysit your child?", imposter: "What Disney character is your favorite?" },
    { real: "What do you always forget to pack on a trip?", imposter: "What do you always pack way too much of on a trip?" },
    { real: "What do you do when nobody is watching you?", imposter: "What weird habit do you hide from roommates?" },
    { real: "What documentary topic would you love to see?", imposter: "What is a conspiracy theory that you believe in?" },
    { real: "What elementary school field trip destination is best?", imposter: "Where was your favorite public place to go when you were 10?" },
    { real: "What emotion do you find the hardest to express?", imposter: "What emotion do most people struggle with?" },
    { real: "What everyday item do you always lose?", imposter: "What item do you keep duplicates of around the house?" },
    { real: "What fairy tale do you want to be part of?", imposter: "What fairy tale story makes no sense?" },
    { real: "What fashion trend from middle school makes you laugh now?", imposter: "What was a popular hair style trend when you were in middle school?" },
    { real: "What fashion trend from the past needs to make a comeback?", imposter: "What fashion trend from the past needs to stay dead?" },
    { real: "What fast food chain has the absolute best fries?", imposter: "What fast food chain has gotten worse over the years?" },
    { real: "What fear from your childhood did you have?", imposter: "What irrational fear makes no sense to you?" },
    { real: "What fictional character would you want to become real?", imposter: "What fictional character would be the best president?" },
    { real: "What fictional or real weapon would you want to own in real life?", imposter: "What fictional or real weapon would you never want to own in real life?" },
    { real: "What food has been in your fridge the longest?", imposter: "What food item goes bad in your fridge the fastest?" },
    { real: "What foreign language is the most sexy?", imposter: "What language would be the hardest to learn?" },
    { real: "What futuristic technology do you hope to see in your lifetime?", imposter: "What sci-fi tech do you think is impossible?" },
    { real: "What historical figure did more bad than good?", imposter: "What historical hero is actually overrated?" },
    { real: "What historical landmark lives up to the hype?", imposter: "What famous monument is underwhelming?" },
    { real: "What hobby do you dedicate your most free time to?", imposter: "What hobby do you want to pick up?" },
    { real: "What human is genuinely funny?", imposter: "Which one of your family members is the most cringy?" },
    { real: "What internet meme will never stop being funny?", imposter: "What dead internet trend needs to stay in the past?" },
    { real: "What is a conspiracy theory that you believe?", imposter: "What is the dumbest conspiracy theory you have heard?" },
    { real: "What is a conspiracy theory that you secretly believe?", imposter: "What is the dumbest conspiracy theory you have heard?" },
    { real: "What is a famous quote?", imposter: "What is your favorite movie line?" },
    { real: "What is a food combination that sounds disgusting but tastes amazing?", imposter: "What is a food combination that everyone loves but you hate?" },
    { real: "What is a funny yoga pose?", imposter: "What would you name a brand new yoga pose?" },
    { real: "What is a gift you can always give and people will love?", imposter: "What is the best gift you ever received?" },
    { real: "What is a good life pro tip?", imposter: "What life pro tip doesn’t actually work?" },
    { real: "What is a good name for a cryptocurrency or digital currency?", imposter: "If there was a 67 cent coin, what would you name it?" },
    { real: "What is a red flag in a partner?", imposter: "What's one thing your partner does that annoys you?" },
    { real: "What is a spooky or supernatural thing that might actually be real", imposter: "What Halloween monster is the coolest?" },
    { real: "What is an impressive amount of IG followers?", imposter: "How many IG followers do you have?" },
    { real: "What is one thing in your house you can't live without?", imposter: "What household item do you need to replace the most often?" },
    { real: "What is the best age to have a kid?", imposter: "At what age do you feel you peaked?" },
    { real: "What is the best anime or cartoon series?", imposter: "What anime or cartoon series has the worst characters?" },
    { real: "What is the best candy?", imposter: "What candy is good but not great?" },
    { real: "What is the best catchphrase from a movie or TV show?", imposter: "What catchphrase makes you cringe every time you hear it?" },
    { real: "What is the best feature on a smartwatch?", imposter: "What feature on a smartwatch do you not care about?" },
    { real: "What is the best fictional pet or creature to be your sidekick?", imposter: "What fictional pet or creature would make you sad if it died?" },
    { real: "What is the best food ever?", imposter: "What is the most overrated food ever?" },
    { real: "What is the best hidden gem spot in your city?", imposter: "What tourist trap do people waste their time visiting?" },
    { real: "What is the best holiday?", imposter: "What major holiday do you wish you could skip entirely?" },
    { real: "What is the best museum you have been to?", imposter: "What museum is boring?" },
    { real: "What is the best musical artist of all time?", imposter: "What musical artist gets way too much radio play?" },
    { real: "What is the best poor person meal?", imposter: "What is the worst poor person meal?" },
    { real: "What is the best sequel in movie history?", imposter: "What movie franchise should have stopped after the first one?" },
    { real: "What is the best souvenir you've ever brought home?", imposter: "What is the worst trinket/souvenir people buy?" },
    { real: "What is the best sport?", imposter: "What is the most overrated sport?" },
    { real: "What is the best superbowl party food?", imposter: "What is your favorite type of dip for chips?" },
    { real: "What is the best thing you've ever bought?", imposter: "What electronic device do you use about once a week?" },
    { real: "What is the best type of cookie?", imposter: "What cookie brand is the best?" },
    { real: "What is the dumbest reason you have gotten in trouble?", imposter: "What was the last thing you got in trouble for?" },
    { real: "What is the hardest physical challenge you've ever completed?", imposter: "What is a physical challenge you would have to train for?" },
    { real: "What is the last thing you fixed?", imposter: "What is the last thing you broke?" },
    { real: "What is the most beautiful/handsome person in the world?", imposter: "Name your favorite person here in this game." },
    { real: "What is the most dangerous or thrilling thing you've ever done?", imposter: "What dangerous or thrilling thing would you do if your best friend invited you?" },
    { real: "What is the most depressing day of the week?", imposter: "What day of the week represents the color green?" },
    { real: "What is the most money you've spent on a single vacation?", imposter: "How much does the average person pay a month in rent?" },
    { real: "What is the most spontaneous thing you've ever done?", imposter: "Would you rather date a homeless person or Joy riding a stolen horse?" },
    { real: "What is the scariest animal you've seen in person?", imposter: "What is the grossest bug?" },
    { real: "What is the scariest thing in the ocean?", imposter: "What sea animal is the king of the ocean?" },
    { real: "What is the strangest animal you would eat?", imposter: "What is an animal you would never eat?" },
    { real: "What is the strangest food you've ever tried?", imposter: "What two foods sound like they shouldn't go together, but might actually be delicious?" },
    { real: "What is the strangest item currently sitting in your refrigerator?", imposter: "What condiment do you put on everything?" },
    { real: "What is the stupidest way you've hurt yourself?", imposter: "How did you get your last injury?" },
    { real: "What is the worst gift you have ever received?", imposter: "What is a mediocre gift?" },
    { real: "What is the worst injury you've had from playing a sport or game?", imposter: "What is the last injury you've had?" },
    { real: "What is the worst injury you've had?", imposter: "What is the last injury you've had?" },
    { real: "What is your best bowling score?", imposter: "How much money should I spend on a fancy dinner for 2?" },
    { real: "What is your best feature?", imposter: "What is your most average feature?" },
    { real: "What is your biggest pet peeve when driving or commuting?", imposter: "What bad driving habit do you have?" },
    { real: "What is your bucket-list travel destination?", imposter: "Where is somewhere you would never step foot in?" },
    { real: "What is your dream job?", imposter: "What job looks fun but you would never do it?" },
    { real: "What is your favorite app on your phone?", imposter: "What app do you wish was never invented?" },
    { real: "What is your favorite holiday tradition?", imposter: "What is a weird family tradition people do?" },
    { real: "What is your favorite home cooked meal as a kid?", imposter: "What is your least favorite home cooked meal as a kid?" },
    { real: "What is your favorite type of fruit?", imposter: "What fruit do you not like?" },
    { real: "What is your favorite way to relax?", imposter: "What is an overrated way to relax?" },
    { real: "What is your go-to comfort meal when you are too tired to cook?", imposter: "What is the most simple meal you can cook" },
    { real: "What is your go-to drink?", imposter: "What drink is overrated?" },
    { real: "What is your go-to workout song?", imposter: "What song makes you angry for no reason?" },
    { real: "What is your least favorite household chore?", imposter: "What is your favorite household chore?" },
    { real: "What is your worst bad habit?", imposter: "What bad habit are you never going to stop?" },
    { real: "What job or community is the most toxic?", imposter: "What job or community seems cool?" },
    { real: "What line should artificial intelligence never cross?", imposter: "What are you terrified AI will be able to do?" },
    { real: "What live event was an unforgettable experience?", imposter: "What live event needs to end?" },
    { real: "What makes a person truly \"good\"?", imposter: "What is 1 good deep a person can do to get into heaven?" },
    { real: "What makes life worth living?", imposter: "What is your favorite sweet treat?" },
    { real: "What minor inconvenience ruins your entire day?", imposter: "What major problem can you brush off easily?" },
    { real: "What mobile app did you spend way too much time using?", imposter: "What mobile app is just a scam to get your money?" },
    { real: "What movie did you love growing up?", imposter: "What movie did you hate growing up?" },
    { real: "What natural disaster scares you the most?", imposter: "What natural disaster would be interesting to see in person if you guaranteed to stay safe?" },
    { real: "What news headline would shock you the most?", imposter: "What celebrity death would make you the most sad?" },
    { real: "What Olympic event is the most fun to watch?", imposter: "What Olympic sport makes no sense as a competition?" },
    { real: "What outdoor activity do you find completely boring?", imposter: "What outdoor activity is totally worth the hype?" },
    { real: "What outdoor activity do you find completely relaxing?", imposter: "What outdoor activity feels like a chore?" },
    { real: "What performer do you want to do the Super Bowl halftime?", imposter: "What performer deserves to be canceled?" },
    { real: "What personal accomplishment are you most proud of achieving?", imposter: "What is your highest level of education?" },
    { real: "What personal boundary do you have?", imposter: "What is a physical action do you not want done to you?" },
    { real: "What pet name is the most creative?", imposter: "What was one of your pets' names?" },
    { real: "What piece of clothing do you take off first?", imposter: "What piece of clothing is the most important?" },
    { real: "What piece of modern technology would you miss most if it disappeared from existence?", imposter: "What piece of modern technology do you wish never existed?" },
    { real: "What piece of technology will become completely obsolete next?", imposter: "What dead technology would you bring back?" },
    { real: "What pizza topping should be declared a crime?", imposter: "What is the best gourmet pizza topping?" },
    { real: "What playground equipment was the most dangerous?", imposter: "What playground equipment was the most fun?" },
    { real: "What professional athlete is an absolute legend?", imposter: "What athlete is completely overrated?" },
    { real: "What purchase did you regret?", imposter: "What is the last thing you bought online?" },
    { real: "What quality do you value above all else in a partner?", imposter: "What physical trait are you most attracted to?" },
    { real: "What reality TV show do you secretly judge people for watching", imposter: "What reality TV show could you actually win?" },
    { real: "What responsibility comes with having wealth or power?", imposter: "What charity is the best?" },
    { real: "What river or lake activity is the most fun?", imposter: "What water sport looks exhausting?" },
    { real: "What road trip destination is completely overrated?", imposter: "Which state has the dumbest population?" },
    { real: "What road trip snack is a non-negotiable buy?", imposter: "What gas station food did you regret eating?" },
    { real: "What routine takes the longest time in your day?", imposter: "What is something you do every single day?" },
    { real: "What scent makes you feel instantly nostalgic or safe?", imposter: "What smell makes you hold your breath?" },
    { real: "What scent or smell instantly brings back a memory?", imposter: "What bad smell makes you gag instantly?" },
    { real: "What school grade did you enjoy the most? (Kindergarten - 12th grade)", imposter: "What school grade did you hate the most? (Kindergarten - 12th grade)" },
    { real: "What sci-fi technology do you wish existed right now?", imposter: "What futuristic tech will ruin the world?" },
    { real: "What seafood is the best?", imposter: "What is a fish you wouldn’t eat?" },
    { real: "What search engine would use if Google didn’t exist?", imposter: "What was the first search engine you ever used besides Google?" },
    { real: "What shoe brand is the most comfortable for daily walking?", imposter: "What shoe brand is the most stylish?" },
    { real: "What show is actually worth watching?", imposter: "What show did you hate but you couldn’t stop watching?" },
    { real: "What smart home devices would be the most useful?", imposter: "What smart home device would you never use?" },
    { real: "What social media platform is the most toxic?", imposter: "What social media platform could vanish tomorrow and you wouldn't care?" },
    { real: "What soda goes best with pizza?", imposter: "What soda did you used to like but now dislike?" },
    { real: "What song will you always sing along to when you are alone?", imposter: "What song do you skip the second it comes on?" },
    { real: "What sound drives you completely insane?", imposter: "What background noise helps you focus?" },
    { real: "What spelling bee word would make you lose?", imposter: "Make up a word with at least 8 letters." },
    { real: "What sport would you most likely be able to go pro in?", imposter: "What pro sport does no one watch?" },
    { real: "What subject in school were you best at?", imposter: "What subject in school were you worst at?" },
    { real: "What subscription service is completely worth the price?", imposter: "Which subscription would you never pay for?" },
    { real: "What superhero power would be the most inconvenient to have?", imposter: "What superhero power is totally overrated?" },
    { real: "What team sport has the most intense fan base?", imposter: "What sports team do you actively root against?" },
    { real: "What tech invention changed human history the most?", imposter: "What tech shouldn't have been invented?" },
    { real: "What temperature do you keep your thermostat at?", imposter: "What room temperature is slightly too hot?" },
    { real: "What texture do you absolutely hate?", imposter: "What food has a weird texture?" },
    { real: "What Thanksgiving side dish steals the show from the turkey?", imposter: "What Thanksgiving food do you skip?" },
    { real: "What theme park ride is the absolute best?", imposter: "What's the scariest theme park ride you have been on?" },
    { real: "What time do you naturally wake up on your days off?", imposter: "What time do you wake up for work?" },
    { real: "What topic can you talk about for hours?", imposter: "What topic do a lot of people love that you don't care about?" },
    { real: "What trait do you inherit from your parents that you hate?", imposter: "What trait from your family are you most proud of?" },
    { real: "What trait separates a leader from a follower?", imposter: "What is a quality a sociopath has?" },
    { real: "What TV or Movie ending completely ruined the rest of the film?", imposter: "What movie or tv show had the best plot twist?" },
    { real: "What TV show would you recommend to someone that has never seen TV?", imposter: "What TV show is overrated?" },
    { real: "What Valentine's Day date idea is romantic?", imposter: "What Valentine's Day date idea is cliché?" },
    { real: "What vegetable do you refuse to eat voluntarily?", imposter: "What vegetable is surprisingly good when cooked right?" },
    { real: "What video game could you play for 24 hours straight?", imposter: "What video game did you regret buying?" },
    { real: "What was your best Halloween costume?", imposter: "What Halloween costume is played out?" },
    { real: "What was your favorite childhood toy?", imposter: "What toy did you always want but never got?" },
    { real: "What was your favorite family vacation when you were little?", imposter: "Where is the worst place your family took you on vacation?" },
    { real: "What was your first word?", imposter: "What would be a hilarious first word for a baby?" },
    { real: "What website do you visit the most?", imposter: "What web site did you used to use a lot but stopped?" },
    { real: "What weird food combination do you secretly love?", imposter: "What 2 foods sound gross together but might be delicious?" },
    { real: "What winter sport looks terrifying?", imposter: "What is the best winter sport?" },
    { real: "What word makes you cringe?", imposter: "What is a word that sounds like a cuss word but isn’t?" },
    { real: "What youth sport did you play most?", imposter: "What sport do you wish your parents put you in when you were in elementary school?" },
    { real: "What YouTube channel or video do you like?", imposter: "What is a viral youtube video?" },
    { real: "What's the grossest thing one of your friends has done?", imposter: "What's the grossest thing you have done?" },
    { real: "What's the longest you have gone without showering?", imposter: "What's the most days you have gone without eating vegetables?" },
    { real: "What's the perfect number of chicken nuggets in a meal?", imposter: "How many hours of sleep do you wish you could get every night?" },
    { real: "When was the last time you cleaned your phone screen?", imposter: "When was the last time you washed your feet?" },
    { real: "Where is the worst place you have thrown up?", imposter: "What place would you be most embarrassed to throw up?" },
    { real: "Where was the best place you kissed someone for the first time?", imposter: "Where is the weirdest place you’ve ever fallen asleep?" },
    { real: "Which celebrity would you want to meet most?", imposter: "Which celebrity would you cheat on your partner with?" },
    { real: "Who here is the best at remembering birthdays and anniversaries?", imposter: "Whose birthday do people always accidentally forget?" },
    { real: "Who here is the most likely to get arrested?", imposter: "Who here is the nicest?" },
    { real: "Who here would make the best reality TV show contestant?", imposter: "Who here would get voted off a reality show first?" },
    { real: "Who in this game tells the best stories?", imposter: "Who in this game is the most funny?" },
    { real: "Who is the most influential person in your life?", imposter: "Who in your life gives the worst advice?" },
    { real: "Who is the most responsible person you know?", imposter: "Who is the most irresponsible person you know?" },
    { real: "Who is your all-time favorite villain?", imposter: "Which celebrity is a real life villain?" },
    { real: "Who would you call first if you won the lottery?", imposter: "Who is the least trustworthy person here?" }
];

io.on('connection', (socket) => {
    socket.on('create_room', ({ playerName, icon }) => {
        const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
        rooms[roomCode] = {
            host: socket.id,
            players: [{ id: socket.id, name: playerName, icon, score: 0, answer: '', vote: null }],
            state: 'lobby',
            currentPromptIndex: 0
        };
        socket.join(roomCode);
        socket.emit('room_joined', { roomCode, players: rooms[roomCode].players, isHost: true });
    });

    socket.on('join_room', ({ roomCode, playerName, icon }) => {
        const room = rooms[roomCode];
        if (!room) {
            return socket.emit('error_message', 'Case code not found.');
        }
        if (room.state !== 'lobby') {
            return socket.emit('error_message', 'Investigation already in progress.');
        }
        if (room.players.some(p => p.icon === icon)) {
            return socket.emit('error_message', 'That detective icon is already taken in this room.');
        }

        room.players.push({ id: socket.id, name: playerName, icon, score: 0, answer: '', vote: null });
        socket.join(roomCode);
        socket.emit('room_joined', { roomCode, players: room.players, isHost: false });
        io.to(roomCode).emit('update_players', room.players);
    });

    socket.on('start_game', (roomCode) => {
        const room = rooms[roomCode];
        if (!room || room.host !== socket.id) return;
        if (room.players.length < 3) {
            return socket.emit('error_message', 'Need at least 3 detectives to open the case.');
        }

        startNewRound(roomCode);
    });

    socket.on('submit_answer', ({ roomCode, answer }) => {
        const room = rooms[roomCode];
        if (!room) return;
        const player = room.players.find(p => p.id === socket.id);
        if (player) {
            player.answer = answer;
        }

        if (room.players.every(p => p.answer.trim() !== '')) {
            room.state = 'discussion';
            io.to(roomCode).emit('show_discussion', {
                innocentPrompt: room.currentPair.real,
                players: room.players.map(p => ({ id: p.id, name: p.name, icon: p.icon, answer: p.answer }))
            });
        }
    });

    socket.on('trigger_discussion_timer', (roomCode) => {
        const room = rooms[roomCode];
        if (!room || room.host !== socket.id) return;
        io.to(roomCode).emit('start_discussion_timer_ui', 30);
    });

    socket.on('start_voting_phase_host', (roomCode) => {
        const room = rooms[roomCode];
        if (!room || room.host !== socket.id) return;
        room.state = 'voting';
        room.players.forEach(p => p.vote = null);
        io.to(roomCode).emit('start_voting');
    });

    socket.on('submit_vote', ({ roomCode, votedId }) => {
        const room = rooms[roomCode];
        if (!room) return;
        const player = room.players.find(p => p.id === socket.id);
        if (player) {
            player.vote = votedId;
        }

        const voteStatuses = room.players.map(p => ({ id: p.id, hasVoted: p.vote !== null }));
        io.to(roomCode).emit('update_vote_status', voteStatuses);

        if (room.players.every(p => p.vote !== null)) {
            processRoundResults(roomCode);
        }
    });

    socket.on('next_round', (roomCode) => {
        const room = rooms[roomCode];
        if (!room || room.host !== socket.id) return;
        startNewRound(roomCode);
    });

    socket.on('disconnect', () => {
        for (const roomCode in rooms) {
            const room = rooms[roomCode];
            const index = room.players.findIndex(p => p.id === socket.id);
            if (index !== -1) {
                room.players.splice(index, 1);
                if (room.players.length === 0) {
                    delete rooms[roomCode];
                } else {
                    if (room.host === socket.id) {
                        room.host = room.players[0].id;
                        io.to(room.host).emit('you_are_host');
                    }
                    io.to(roomCode).emit('update_players', room.players);
                }
                break;
            }
        }
    });
});

function startNewRound(roomCode) {
    const room = rooms[roomCode];
    room.state = 'game';
    room.currentPair = promptPairs[Math.floor(Math.random() * promptPairs.length)];
    const imposterIndex = Math.floor(Math.random() * room.players.length);
    room.imposterId = room.players[imposterIndex].id;

    room.players.forEach((p, idx) => {
        p.answer = '';
        p.vote = null;
        const assignedPrompt = (idx === imposterIndex) ? room.currentPair.imposter : room.currentPair.real;
        io.to(p.id).emit('game_started', { prompt: assignedPrompt });
    });
}

function processRoundResults(roomCode) {
    const room = rooms[roomCode];
    room.state = 'scores';

    const totalPlayers = room.players.length;
    const votesForImposter = room.players.filter(p => p.vote === room.imposterId).length;
    const imposterCaught = votesForImposter >= (totalPlayers / 2);

    room.players.forEach(p => {
        if (p.id === room.imposterId) {
            if (!imposterCaught) {
                p.score += 3;
            }
        } else {
            if (p.vote === room.imposterId) {
                p.score += 1;
            }
        }
    });

    let gameOver = false;
    let champion = null;
    const leadingPlayer = room.players.reduce((max, p) => (p.score > max.score ? p : max), room.players[0]);
    if (leadingPlayer.score >= 21) {
        gameOver = true;
        champion = leadingPlayer;
    }

    io.to(roomCode).emit('round_results', {
        players: room.players.map(p => ({ id: p.id, name: p.name, icon: p.icon, score: p.score, vote: p.vote })),
        imposterId: room.imposterId,
        imposterCaught,
        gameOver,
        champion
    });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});