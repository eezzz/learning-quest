/* People Lab data: social scenarios, written like short social stories.
   m = mission number. The FIRST option is the best answer (options are shuffled on screen).
   Every option has a "why" so the hidden social rule is always explained, never just marked wrong.
   Problem-size items use sz (0 small, 1 medium, 2 big) instead of options. */
const SOCIAL=[
 // 1 Feelings Detective
 {m:1,e:'😣🧱',s:"Leo's block tower fell down. His face is red. His hands are in fists.",q:'How does Leo feel?',o:[
  ['Frustrated or angry','Yes! A red face and fists are clues for a strong, upset feeling.'],
  ['Happy','Happy people usually smile and look relaxed. Look at the clues again: red face, fists.'],
  ['Sleepy','Sleepy people yawn and rub their eyes. Leo has fists and a red face.']]},
 {m:1,e:'🥳🎂',s:'Ana is smiling. She is jumping up and down. It is her birthday.',q:'How does Ana feel?',o:[
  ['Excited','Yes! Smiling and jumping are clues for excited. Birthdays are exciting!'],
  ['Scared','Scared people often freeze or hide. Ana is smiling and jumping.'],
  ['Bored','Bored people sigh and look away. Ana is jumping with a big smile.']]},
 {m:1,e:'😢🪑',s:'Sam is sitting alone. He is looking down. His lip is shaking.',q:'How does Sam feel?',o:[
  ['Sad','Yes! Looking down, sitting alone and a shaking lip are clues for sad.'],
  ['Silly','Silly people laugh and make funny faces. These clues show a different feeling.'],
  ['Proud','Proud people stand tall and smile. Sam is looking down.']]},
 {m:1,e:'😟🏫',s:'Priya is hiding behind her mom. It is her first day at a new school.',q:'How does Priya feel?',o:[
  ['Nervous or shy','Yes! New places can feel scary. Hiding is a clue for nervous or shy.'],
  ['Angry','Angry people may yell or make fists. Priya is hiding quietly.'],
  ['Excited','Excited people often run toward things. Priya is hiding.']]},
 {m:1,e:'😱🐕',s:"A big dog barked right next to Max. Max's eyes are wide. He jumped back.",q:'How does Max feel?',o:[
  ['Scared','Yes! Wide eyes and jumping back are clues for scared.'],
  ['Happy','A loud surprise usually does not feel happy. Look at his eyes and body.'],
  ['Tired','Tired people move slowly. Max jumped back fast.']]},
 {m:1,e:'🥱📖',s:'You are telling your friend a long story. She yawns and looks around the room.',q:'What might she be feeling?',o:[
  ['Tired, or ready for a new topic','Yes! Yawning and looking away are clues. You could ask: "Do you want to talk about something else?"'],
  ['Very excited about your story','Excited listeners usually look at you and ask questions. Yawning is a different clue.'],
  ['Angry at you','Angry people may frown or cross their arms. Yawning usually means tired or bored, not angry.']]},
 {m:1,e:'😄🙌',s:'You tell Grandpa a joke. He laughs and gives you a high five.',q:'How does Grandpa feel?',o:[
  ['Happy. He liked the joke!','Yes! Laughing and a high five are clues that he enjoyed it.'],
  ['Upset','Upset people do not usually laugh and high five. Those are happy clues.'],
  ['Scared','Scared people do not usually laugh and high five.']]},

 // 2 Problem sizes (sz: 0 small, 1 medium, 2 big)
 {m:2,e:'✏️',s:'The tip of your pencil breaks.',sz:0,why:'Small problem. You can fix it yourself: sharpen it or get a new pencil.'},
 {m:2,e:'🖍️',s:'Someone took the red crayon you wanted.',sz:0,why:'Small problem. You can use another color, or wait and ask for a turn.'},
 {m:2,e:'🎲',s:'You lost a game at recess.',sz:0,why:'Small problem. Losing feels bad for a moment, but you can play again tomorrow.'},
 {m:2,e:'🤢',s:'You feel sick at school and your tummy hurts a lot.',sz:1,why:'Medium problem. Tell your teacher so a grown-up can help you.'},
 {m:2,e:'🎒',s:'You left your homework at home.',sz:1,why:'Medium problem. Tell your teacher. Together you can make a plan.'},
 {m:2,e:'🤕',s:'A classmate fell off the slide and is hurt.',sz:2,why:'Big problem. Get a grown-up right away.'},
 {m:2,e:'🚨',s:'The fire alarm is ringing.',sz:2,why:'Big problem. Stay calm and follow your teacher right away.'},
 {m:2,e:'💧',s:'You spilled a little water on your desk.',sz:0,why:'Small problem. Get a paper towel and wipe it up.'},
 {m:2,e:'✏️😤',s:'Your pencil broke during a test.',q:'Which reaction matches the size of the problem?',o:[
  ['Say "oh well" and sharpen it','Yes! A small problem gets a small reaction.'],
  ['Scream and throw the pencil','That is a big reaction for a small problem. It could scare others or get you in trouble.'],
  ['Cry for the rest of the day','That is a big reaction for a small problem. A new pencil fixes it.']]},
 {m:2,e:'🧃😕',s:'Your juice box spilled a little at lunch.',q:'Which reaction matches the size of the problem?',o:[
  ['Get a napkin and wipe it up','Yes! Small problem, small reaction. Problem solved!'],
  ['Yell "This is the worst day ever!"','That is a big reaction for a small problem. A napkin can fix it.'],
  ['Hide under the table','That is a big reaction. A napkin can fix it quickly.']]},

 // 3 Calm-down tools
 {m:3,e:'🔊😖',s:'The classroom is very loud and your ears hurt.',q:'What is a good thing to do?',o:[
  ['Cover your ears or ask for a quiet break','Yes! Taking care of your ears is smart. Asking for a break is a great tool.'],
  ['Yell "BE QUIET!"','Yelling makes it even louder, and others may feel upset.'],
  ['Run out of the room without telling anyone','Grown-ups need to know where you are to keep you safe. Ask for a break instead.']]},
 {m:3,e:'😠🎲',s:'You lost a game and you feel very angry.',q:'What is a good way to calm down?',o:[
  ['Take 5 slow breaths','Yes! Slow breaths tell your body it is safe. Then the angry feeling gets smaller.'],
  ['Hit the table','Hitting can hurt you or break things. The angry feeling does not go away.'],
  ['Shout "You cheated!"','Blaming others can hurt their feelings. Calm your body first.']]},
 {m:3,e:'🐛💺',s:'Your body feels wiggly and you cannot sit still in class.',q:'What could help?',o:[
  ['Ask for a movement break or squeeze a fidget','Yes! Some bodies need to move. Asking for a break is a smart tool.'],
  ['Poke the person next to you','Poking can bother or hurt others. Use a fidget or ask for a break.'],
  ['Roll on the floor during the lesson','That can stop the class. Ask for a movement break instead.']]},
 {m:3,e:'😰📝',s:'You feel worried about a test tomorrow.',q:'What could help?',o:[
  ['Tell a grown-up and make a plan together','Yes! Talking about worries makes them smaller. A plan helps your brain feel ready.'],
  ['Hide the test paper','Hiding does not make the worry go away. A grown-up can help.'],
  ['Keep the worry a secret','Worries often grow when we keep them inside. Sharing helps.']]},
 {m:3,e:'🌧️🚌',s:'The field trip is cancelled because of rain. You were really excited.',q:'What is a good thing to do?',o:[
  ['Feel disappointed, take a breath, and ask about the new plan','Yes! It is OK to feel disappointed. Then find out Plan B.'],
  ['Refuse to do anything all day','That makes the whole day hard. Plan B can still be fun.'],
  ['Scream until they change it back','Screaming cannot stop the rain. Calm down, then ask about Plan B.']]},
 {m:3,e:'🌡️🔥',s:'On your feelings thermometer, you are at 5 out of 5. You are very, very upset.',q:'What should you do FIRST?',o:[
  ['Calm your body first, then solve the problem','Yes! When feelings are at 5, the thinking brain needs a break first. Breathe, then solve.'],
  ['Solve the problem right now while yelling','It is very hard to think when you are that upset. Calm first, then solve.'],
  ['Tell everyone they are wrong','That can make the problem bigger. Calm your body first.']]},

 // 4 Conversation ping-pong
 {m:4,e:'🏖️🗣️',s:'Your friend says: "I went to the beach this weekend!"',q:'What is a good reply?',o:[
  ['"Cool! What did you see there?"','Yes! You asked about HER topic. That keeps the ping-pong going.'],
  ['"Volcanoes can be 1,000 degrees! Lava is..."','Volcanoes are cool, but this changes the topic. First ask about her beach trip.'],
  ['Say nothing and walk away','She might feel ignored. Try asking a question back.']]},
 {m:4,e:'🐙😐',s:'You are telling a friend about octopuses. She looks away and says "uh-huh" in a flat voice.',q:'What might that mean?',o:[
  ['She might want a turn or a new topic','Yes! Looking away and a flat voice are clues. You can ask what she wants to talk about.'],
  ['She wants 10 more octopus facts','Looking away can mean she wants a change, but not always. The best way to know is to ask her!'],
  ['She is angry at octopuses','It is probably not about octopuses. She might just want a turn to talk.']]},
 {m:4,e:'🦈❓',s:'You love sharks. You have told your friend 5 shark facts already.',q:'What is a good thing to say next?',o:[
  ['"Do you want to hear more, or talk about something else?"','Yes! Checking is kind. Your friend gets to choose, too.'],
  ['Keep talking louder','Talking louder does not help your friend enjoy it more. Check in with a question.'],
  ['Stop talking forever','You do not need to stop forever! Just check if your friend wants more.']]},
 {m:4,e:'🐶🐶',s:'Two kids are talking about their dogs. You want to join.',q:'What is a good way to join?',o:[
  ['Wait for a pause, then say something about dogs','Yes! Waiting for a pause and staying on their topic makes it easy to join.'],
  ['Interrupt: "Guess what! Saturn has rings!"','That is a great fact, but it is a different topic. Join their dog talk first.'],
  ['Stand behind them without talking for a long time','They might not know you want to join. Wait for a pause, then say something.']]},
 {m:4,e:'🏓',s:'Talking is like ping-pong. You just asked your friend a question.',q:'Who talks next?',o:[
  ['Your friend','Yes! You hit the ball over. Now it is your friend\'s turn.'],
  ['You again','If you keep talking, your friend does not get a turn to answer.'],
  ['Nobody','Your friend should get a turn to answer.']]},
 {m:4,e:'👋🙂',s:'A classmate says "Hi!" to you.',q:'What is a good thing to do?',o:[
  ['Say "Hi!" back (you can wave, too)','Yes! Saying hi back shows you heard them. It is a small, friendly thing.'],
  ['Walk away without saying anything','They might think you do not like them. A quick "Hi" is enough.'],
  ['Start telling them about fossils right away','Say hi first. Then you can ask if they want to hear about fossils!']]},

 // 5 Other people's minds
 {m:5,e:'🦕📦',s:'Sam puts his toy dinosaur in the RED box and goes outside. While he is gone, Mom moves it to the BLUE box.',q:'Where will Sam look first?',o:[
  ['In the red box','Yes! Sam did not see Mom move it. He only knows what HE saw.'],
  ['In the blue box','YOU know it is in the blue box, but Sam was outside. He did not see it move.'],
  ['Under the bed','Sam put it in the red box, so that is where he thinks it is.']]},
 {m:5,e:'🎨🎁',s:'Mia made you a drawing. You do not really like it.',q:'What could you say?',o:[
  ['"Thank you for making this for me!"','Yes! You can thank her for her work and kindness. That is true and kind.'],
  ['"This is ugly."','That might be what you think, but it would hurt her feelings. Thank her for trying.'],
  ['Throw it away while she watches','That would make her feel very sad. You can say thank you.']]},
 {m:5,g:[3,5],e:'🐟😭',s:"Your friend's goldfish died. She is crying.",q:'What could you say?',o:[
  ['"I\'m sorry. Do you want to talk or sit together?"','Yes! This shows you care. Right now she needs kindness more than facts.'],
  ['"Goldfish only live a few years anyway."','It may be true, but it can sound like you do not care. Show kindness first.'],
  ['Laugh','Laughing when someone is sad can hurt them a lot.']]},
 {m:5,e:'🕷️😨',s:'Your classmate is scared of spiders. You think spiders are amazing.',q:'What is kind to do?',o:[
  ['Keep spider pictures away from them and pick another topic','Yes! Different people like different things. Being kind means respecting that.'],
  ['Show them lots of spider photos so they stop being scared','That would feel scary for them. Their feelings are real, even if yours are different.'],
  ['Call them a baby','That is unkind. Everyone is scared of something.']]},
 {m:5,e:'🐴🪐',s:'Your friend loves horses. You love planets. You are making a birthday card for her.',q:'What should you draw?',o:[
  ['A horse','Yes! A gift is about what the OTHER person likes.'],
  ['Planets, because you like planets','Planets are great, but the card is for her. Think about what she likes.'],
  ['Nothing','A card with a horse would make her happy!']]},
 {m:5,e:'⚽😞',s:'Tom was not picked for the game. He looks sad.',q:'What could you do?',o:[
  ['Ask, "Do you want to play with us?"','Yes! Including someone can turn their whole day around.'],
  ['Pretend you did not see him','He would still feel left out. A small invite helps a lot.'],
  ['Say, "The team is full forever."','That would make him feel worse. You could invite him.']]},

 // 6 Idioms and hidden meanings
 {m:6,e:'🌧️🐱🐶',s:'Dad looks outside and says: "It\'s raining cats and dogs!"',q:'What does he mean?',o:[
  ['It is raining very hard','Yes! It is an idiom. No animals are falling from the sky.'],
  ['Animals are falling from the sky','That would be amazing, but it is an idiom. It means heavy rain.'],
  ['Pets are playing in the rain','It is an idiom. It means it is raining very hard.']]},
 {m:6,e:'🍽️🐴',s:'Your brother says: "I\'m so hungry I could eat a horse!"',q:'What does he mean?',o:[
  ['He is very, very hungry','Yes! He is not really going to eat a horse. It means VERY hungry.'],
  ['He wants to eat a horse','It is an idiom. People say it when they are really hungry.'],
  ['He likes horses','It is an idiom about being really hungry.']]},
 {m:6,e:'🎭🦵',s:'Before the school play, your friend says: "Break a leg!"',q:'What does she mean?',o:[
  ['Good luck!','Yes! Actors say "break a leg" to mean good luck. Nobody wants you to get hurt.'],
  ['She wants you to get hurt','It is an idiom. It is a friendly way to say good luck.'],
  ['Be careful on the stage','It is an idiom that means good luck.']]},
 {m:6,e:'✋🐎',s:'You start running to the car. Mom says: "Hold your horses!"',q:'What does she mean?',o:[
  ['Wait a moment','Yes! It means slow down and wait.'],
  ['Go find some horses','There are no horses. It is an idiom that means wait.'],
  ['Run faster','It means the opposite: wait a moment.']]},
 {m:6,e:'👩‍🏫👀',s:'A kid says: "Our teacher has eyes in the back of her head!"',q:'What do they mean?',o:[
  ['The teacher notices a lot','Yes! It means she sees what is going on, even when she is facing the board.'],
  ['The teacher has extra eyes','People only have two eyes. It is an idiom.'],
  ['The teacher wears glasses on her head','It is an idiom that means she notices a lot.']]},
 {m:6,g:[3,5],e:'⭕✏️',s:'Your worksheet says: "Circle the -ly adverb."',q:'What should you circle?',o:[
  ['The whole word, like "quietly"','Yes! The adverb is the whole word. "-ly" just tells you how to spot it.'],
  ['Only the letters "ly"','"ly" is how to find it, but the adverb is the whole word, like "quietly".'],
  ['Every word in the sentence','Only circle the adverb, the whole -ly word.']]},
 {m:6,e:'🧂🙏',s:'At dinner, Mom asks: "Can you pass the salt?"',q:'What should you do?',o:[
  ['Pass her the salt','Yes! It sounds like a question, but it is a polite way to ask you to do it.'],
  ['Say "Yes, I can" and do nothing','She is not asking IF you can. She is politely asking you to pass it.'],
  ['Tell her how salt is made','Cool fact! But first pass the salt. That is what she needs.']]},
 {m:6,e:'🍰📝',s:'After the spelling test, a friend says: "That was a piece of cake!"',q:'What does she mean?',o:[
  ['The test was easy','Yes! "A piece of cake" means something was easy.'],
  ['There was cake at the test','It is an idiom. It means easy.'],
  ['She is hungry for cake','It is an idiom. It means the test was easy.']]},
 {m:6,e:'🚗🛣️',s:'Dad says: "Time to hit the road!"',q:'What does he mean?',o:[
  ['It is time to leave','Yes! "Hit the road" means start a trip or leave.'],
  ['He will hit the road with his hand','It is an idiom. Nobody hits anything. It means it is time to go.'],
  ['The road is broken','It is an idiom. It means time to leave.']]},
 {m:6,e:'🧊🧑‍🤝‍🧑',s:'On the first day, the teacher says: "Let\'s play a game to break the ice."',q:'What does she mean?',o:[
  ['Help everyone feel less shy','Yes! "Break the ice" means help people get to know each other.'],
  ['Smash some real ice','There is no ice. It is an idiom about feeling less shy.'],
  ['Make the room colder','It is an idiom about helping people feel comfortable.']]},

 // 7 Playing together and flexible thinking
 {m:7,e:'🎲😬',s:'You lost a board game.',q:'What does a good sport do?',o:[
  ['Say "Good game!"','Yes! Good sports are kind when they win AND when they lose. People will want to play with you again.'],
  ['Flip the board over','That can scare people. They might not want to play again.'],
  ['Say "This game is stupid!"','That can hurt the other players\' feelings. Try "Good game."']]},
 {m:7,e:'🛝⏳',s:'You want the swing, but someone is using it.',q:'What could you do?',o:[
  ['Ask "Can I have a turn when you are done?" and wait','Yes! Asking and waiting is fair. Your turn will come.'],
  ['Pull them off the swing','That is not safe. Someone could get hurt.'],
  ['Cry until they get off','Asking with words works better.']]},
 {m:7,e:'🎯🧩',s:'Your friend wants to play a different game than you.',q:'What is a fair idea?',o:[
  ['Take turns: her game first, then yours','Yes! Taking turns means you both get to choose.'],
  ['Only play your game','Your friend would not get a choice. Taking turns is fair.'],
  ['Go home','You can still have fun together. Try taking turns.']]},
 {m:7,e:'🏃🏃‍♀️',s:'Some kids are playing tag. You want to join.',q:'What could you say?',o:[
  ['"Can I play too?"','Yes! Asking is the clearest way to join.'],
  ['Grab someone and yell "You\'re it!"','They might not know you are playing. Ask first.'],
  ['Wait and hope they ask you','They may not know you want to play. Asking is clearer!']]},
 {m:7,e:'🌧️⛏️',s:'Recess is inside because of rain. You wanted to dig for rocks.',q:'What is a good Plan B?',o:[
  ['Draw a rock or read a rock book','Yes! Plan B keeps the fun going. Flexible thinking is a superpower.'],
  ['Refuse to do anything','That makes recess boring for you. Plan B can still be fun.'],
  ['Yell at the teacher','The teacher cannot stop the rain. Try a Plan B.']]},
 {m:7,e:'📜🙋',s:'Your friend is playing a game with a wrong rule.',q:'What could you say?',o:[
  ['"I think the rule is... Can we check?"','Yes! Saying it kindly helps everyone. You can check the rules together.'],
  ['"You\'re cheating!"','Your friend may just not know the rule. Saying "cheating" can hurt feelings.'],
  ['Quit the game','You can fix it by talking kindly.']]},
 {m:7,e:'🧍↔️🧍',s:'A friend is standing very close to your face. You do not like it.',q:'What could you say?',o:[
  ['"Can you please step back a little?"','Yes! Using words is clear and kind. About one arm\'s length is a comfy space.'],
  ['Push them','Pushing can hurt. Use your words.'],
  ['Scream','Screaming can scare them. A calm sentence works better.']]},

 // 8 Asking for help
 {m:8,e:'🧮❓',s:'You do not understand the math homework.',q:'What should you do?',o:[
  ['Raise your hand and say "Can you help me with this one?"','Yes! Asking for help is smart. Scientists ask questions all the time.'],
  ['Rip up the paper','That does not help you learn, and you would lose your work.'],
  ['Pretend you understand','Then you might stay stuck. Asking helps.']]},
 {m:8,e:'😔🗣️',s:'Someone is mean to you every day.',q:'What should you do?',o:[
  ['Tell a grown-up you trust','Yes! This is not a small problem. Grown-ups can help make it stop.'],
  ['Keep it a secret','Keeping it secret means no one can help you. Tell a grown-up.'],
  ['Be mean back','That can make the problem bigger. A grown-up can help.']]},
 {m:8,e:'🥪❌',s:'You forgot your lunch.',q:'What should you do?',o:[
  ['Tell your teacher','Yes! Your teacher can help you get food.'],
  ['Take someone else\'s lunch','That is not fair to them. Ask a grown-up for help.'],
  ['Skip lunch and say nothing','Your body needs food. Tell your teacher.']]},
 {m:8,e:'1️⃣2️⃣3️⃣',s:'The teacher gave 3 steps. You only remember step 1.',q:'What could you do?',o:[
  ['Ask, "Can you say the steps again?" or look at the board','Yes! Checking is smart. Lots of people forget steps.'],
  ['Guess the other steps','Guessing can go wrong. It is OK to ask again.'],
  ['Do nothing','Then you will be stuck. Ask or look at the board.']]},
 {m:8,e:'✅😑',s:'You finished your work early and feel bored.',q:'What is a good thing to do?',o:[
  ['Ask the teacher what to do next, or read quietly','Yes! That keeps you busy without bothering others.'],
  ['Talk loudly to the kids who are still working','They need quiet to finish. Ask the teacher or read.'],
  ['Walk around the room','That can distract others. Ask the teacher what to do.']]},
 {m:8,e:'🎧😣',s:'The noise in the lunchroom is too much for you.',q:'What could you do?',o:[
  ['Ask a grown-up if you can eat somewhere quieter','Yes! Knowing what your body needs and asking for it is a great skill.'],
  ['Cover your ears and yell','Covering your ears is OK. Yelling adds more noise, so ask a grown-up for a quieter spot.'],
  ['Stop eating','Your body needs lunch. Ask for a quieter spot.']]}
];
