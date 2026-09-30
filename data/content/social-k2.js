/* People Lab data for Kindergarten to Grade 2.
   Same shape as SOCIAL in social-data.js, plus g = [minGrade, maxGrade] (0 = Kindergarten).
   Short sentences, read aloud. The FIRST option is the best answer (options are shuffled on screen).
   Problem-size items use sz (0 small, 1 medium, 2 big) and why instead of q/o. */
const SOCIAL_K2=[
 // 1 Feelings Detective
 {m:1,g:[0,1],e:"😢🍦",s:"Ben dropped his ice cream. He is crying.",q:"How does Ben feel?",o:[
  ["Sad","Yes! Crying is a clue for sad."],
  ["Happy","Happy kids often smile. Ben is crying."],
  ["Sleepy","Sleepy kids yawn. Ben is crying."]]},
 {m:1,g:[0,1],e:"😄🎈",s:"Mia got a red balloon. She has a big smile.",q:"How does Mia feel?",o:[
  ["Happy","Yes! A big smile is a clue for happy."],
  ["Sad","Sad kids may cry or look down. Mia is smiling."],
  ["Angry","Angry kids may frown or stomp. Mia is smiling."]]},
 {m:1,g:[0,1],e:"😠🧱",s:"Leo's tower fell down. He frowns and stomps his feet.",q:"How does Leo feel?",o:[
  ["Mad","Yes! Frowning and stomping are clues for mad."],
  ["Happy","Happy kids often smile. Leo is frowning."],
  ["Sleepy","Sleepy kids yawn. Leo is stomping."]]},
 {m:1,g:[0,1],e:"😨⛈️",s:"There is a loud boom of thunder. Zoe hides under her blanket.",q:"How does Zoe feel?",o:[
  ["Scared","Yes! Hiding after a loud boom is a clue for scared."],
  ["Silly","Silly kids giggle and make funny faces. Zoe is hiding."],
  ["Proud","Proud kids stand tall and smile. Zoe is hiding."]]},
 {m:1,g:[0,1],e:"🥱🛏️",s:"Noah yawns and rubs his eyes. It is bedtime.",q:"How does Noah feel?",o:[
  ["Tired","Yes! Yawning and rubbing eyes are clues for tired."],
  ["Excited","Excited kids jump and wiggle. Noah is yawning."],
  ["Angry","Angry kids may frown or yell. Noah is yawning."]]},
 {m:1,g:[0,2],e:"😟🏫",s:"It is Priya's first day at a new school. She holds Dad's hand very tight.",q:"How does Priya feel?",o:[
  ["Nervous","Yes! New places can feel scary. Holding on tight is a clue for nervous."],
  ["Silly","Silly kids giggle. Priya is holding on tight."],
  ["Bored","Bored kids sigh and look around. Priya is holding on tight."]]},
 {m:1,g:[0,2],e:"🤩🎁",s:"Kai is opening a birthday present. He jumps up and down.",q:"How does Kai feel?",o:[
  ["Excited","Yes! Jumping up and down is a clue for excited."],
  ["Sad","Sad kids may cry or sit still. Kai is jumping."],
  ["Scared","Scared kids may hide. Kai is jumping for joy."]]},
 {m:1,g:[1,2],e:"🙌🐶",s:"Omar's dog came home from the vet. Omar grins and flaps his hands.",q:"How does Omar feel?",o:[
  ["Happy","Yes! Some kids flap their hands when happy. His grin is a clue too."],
  ["Scared","Scared kids may hide or freeze. Omar is grinning."],
  ["Bored","Bored kids sigh and look away. Omar is grinning."]]},

 // 2 Problem sizes (sz: 0 small, 1 medium, 2 big)
 {m:2,g:[0,1],e:"🖍️",s:"Your crayon broke.",sz:0,why:"Small problem. You can use another crayon."},
 {m:2,g:[0,1],e:"💧",s:"You spilled a little water on the table.",sz:0,why:"Small problem. Get a paper towel and wipe it up."},
 {m:2,g:[0,1],e:"👟",s:"Your shoe came untied.",sz:0,why:"Small problem. Tie it, or ask a grown-up to help."},
 {m:2,g:[0,2],e:"🤒",s:"Your tummy hurts a lot at school.",sz:1,why:"Medium problem. Tell your teacher so a grown-up can help you."},
 {m:2,g:[0,2],e:"🧥",s:"You cannot find your coat at school.",sz:1,why:"Medium problem. Ask your teacher to help you look."},
 {m:2,g:[0,1],e:"🤕",s:"Your friend fell off the slide. He is hurt and crying.",sz:2,why:"Big problem. Get a grown-up right away."},
 {m:2,g:[0,1],e:"🚨",s:"The fire alarm is ringing.",sz:2,why:"Big problem. Stay calm and follow your teacher right away."},
 {m:2,g:[0,2],e:"🧩😕",s:"One puzzle piece is missing.",q:"Which choice fits the size of the problem?",o:[
  ["Say “Oh well” and keep going","Yes! A small problem gets a small reaction."],
  ["Scream and throw the puzzle","That is a big reaction for a small problem. Someone could get hurt."],
  ["Say “This is the worst day ever!”","That is a big reaction. One missing piece is a small problem."]]},

 // 3 Calm-down tools
 {m:3,g:[0,1],e:"😠🧱",s:"Your tower fell. You feel very mad.",q:"What can help you calm down?",o:[
  ["Take slow, deep breaths","Yes! Slow breaths help your body calm down. Then the mad gets smaller."],
  ["Kick the blocks","Kicking can hurt your foot or break things. The mad feeling stays."],
  ["Yell at your friend","Yelling can hurt your friend's feelings. Breathe first."]]},
 {m:3,g:[0,2],e:"🔊🎧",s:"The room is too loud for your ears.",q:"What can help?",o:[
  ["Ask for headphones or a quiet spot","Yes! Your ears matter. Asking for quiet is a great tool."],
  ["Yell “Stop!” at everyone","Yelling makes more noise. Others may feel upset."],
  ["Run away without telling a grown-up","Grown-ups need to know where you are. That keeps you safe."]]},
 {m:3,g:[0,1],e:"😤🛋️",s:"You feel mad at home.",q:"What is a safe way to let it out?",o:[
  ["Squeeze a pillow hard","Yes! Squeezing a pillow is safe. It helps big feelings get smaller."],
  ["Throw your toy at the wall","The toy could break, or someone could get hurt."],
  ["Hit your brother","Hitting hurts. Your brother would feel sad and scared."]]},
 {m:3,g:[0,1],e:"😢🤗",s:"You had a hard day. You feel sad.",q:"What could help?",o:[
  ["Ask a grown-up for a hug or talk","Yes! Sharing a sad feeling with a grown-up can make it smaller."],
  ["Break your crayons","Then your crayons are broken, and you still feel sad."],
  ["Hide and tell no one","Sad feelings can grow when we keep them inside. A grown-up can help."]]},
 {m:3,g:[0,2],e:"😰🔢",s:"It is almost your turn to talk to the class. You feel worried.",q:"What could help?",o:[
  ["Count slowly to 5","Yes! Counting slowly helps your body feel calm and ready."],
  ["Run out of the room","Your teacher would worry about you. Tell her you feel worried instead."],
  ["Keep the worry a secret","Worries can grow inside. Telling a grown-up can help."]]},
 {m:3,g:[0,1],e:"🥵💧",s:"You ran a lot at recess. Now you feel hot and grumpy.",q:"What could help?",o:[
  ["Drink some water and rest","Yes! Water and rest help a hot, tired body feel better."],
  ["Take a friend's water without asking","That is not fair to your friend. Ask a grown-up for water."],
  ["Stomp and shout at everyone","Shouting can upset others. Your body still feels hot."]]},
 {m:3,g:[0,2],e:"🐛🪑",s:"Your body feels wiggly at circle time.",q:"What could help?",o:[
  ["Use a fidget or ask to move","Yes! Some bodies need to move. Asking for a move break is smart."],
  ["Poke the kid next to you","Poking can bother or hurt them. Try a fidget instead."],
  ["Roll across the rug during the story","Others may not hear the story. Ask for a move break instead."]]},

 // 4 Conversation ping-pong
 {m:4,g:[0,1],e:"👋🙂",s:"A friend says, “Hi, Mia!”",q:"What is a good thing to do?",o:[
  ["Say “Hi!” back or wave","Yes! Saying hi or waving shows you heard your friend."],
  ["Walk away without a word","Your friend might think you are upset with them. A quick wave is enough."],
  ["Start talking about trains right away","Say hi first. Then you can ask if they want to hear about trains!"]]},
 {m:4,g:[0,1],e:"🐶🗣️",s:"Sam says, “I got a new puppy!”",q:"What is a good reply?",o:[
  ["“Cool! What is its name?”","Yes! You asked about Sam's topic. That keeps the talk going."],
  ["“I like trucks.”","Trucks are fun, but Sam wants to talk about his puppy."],
  ["Say nothing and walk away","Sam might feel ignored. Try asking a question back."]]},
 {m:4,g:[0,1],e:"🏓",s:"Talking is like a ball game. You just asked your friend a question.",q:"Who talks next?",o:[
  ["Your friend","Yes! You sent the ball over. Now it is your friend's turn."],
  ["You again","If you keep talking, your friend does not get a turn."],
  ["Nobody","Your friend should get a turn to answer."]]},
 {m:4,g:[0,2],e:"🍎🍕",s:"At lunch, Leo asks, “What is your favorite food?”",q:"What is a good thing to do?",o:[
  ["Answer, then ask, “What's yours?”","Yes! Answer, then ask back. That keeps the talk going like ping-pong."],
  ["Do not answer at all","Leo might think you did not hear him. A short answer is fine."],
  ["Talk about your shoes","Leo asked about food. Answer his question first."]]},
 {m:4,g:[0,2],e:"🐱👂",s:"Rosa is telling you about her cat.",q:"How can you show you are listening?",o:[
  ["Say “Wow!” or ask about her cat","Yes! Words and questions show you are listening. You do not have to look at her."],
  ["Walk away while she talks","Rosa might feel sad. She wanted to share with you."],
  ["Start singing a loud song","Rosa cannot finish her story. Singing can wait until later."]]},
 {m:4,g:[1,2],e:"🦖❓",s:"You love dinosaurs. You told Ava lots of dinosaur facts.",q:"What could you ask her?",o:[
  ["“Do you want more, or a new topic?”","Yes! Checking lets Ava choose too. Then you both enjoy talking."],
  ["Keep going and talk louder","Talking louder does not help Ava enjoy it more. Check with a question."],
  ["Stop talking to her forever","You do not need to stop! Just check what Ava wants."]]},
 {m:4,g:[1,2],e:"🙋‍♀️💭",s:"Your friend is talking. You think of something fun to say.",q:"What could you do?",o:[
  ["Hold the idea and wait for a pause","Yes! Waiting lets your friend finish. Then it is your turn."],
  ["Talk over your friend","Your friend may feel you did not care about their words."],
  ["Shout your idea very loud","Shouting can startle your friend. Wait for a pause instead."]]},

 // 5 Other people's minds
 {m:5,g:[0,1],e:"🐦🪟",s:"You see a bird out the window. Mia is facing the other way.",q:"Does Mia see the bird?",o:[
  ["No, she is facing the other way","Yes! People only see what is in front of their eyes."],
  ["Yes, she sees what you see","You see the bird, but Mia's eyes point the other way."],
  ["She sees two birds","Mia is facing away, so she does not see the bird."]]},
 {m:5,g:[1,2],e:"🍪📦",s:"Kai puts his cookie in the red box and goes outside. Mom moves it to the blue box.",q:"Where will Kai look first?",o:[
  ["In the red box","Yes! Kai did not see Mom move it. He only knows what he saw."],
  ["In the blue box","You know it moved, but Kai was outside. He did not see."],
  ["Under the bed","Kai put it in the red box. That is where he thinks it is."]]},
 {m:5,g:[0,2],e:"🎨🎁",s:"Lily made you a picture. You do not love it.",q:"What could you say?",o:[
  ["“Thank you for making this!”","Yes! Lily worked hard for you. Thanking her is true and kind."],
  ["“This is ugly.”","That would hurt Lily's feelings. You can thank her for trying."],
  ["Throw it in the trash","Lily would feel very sad. You can say thank you."]]},
 {m:5,g:[0,2],e:"🐱🚚",s:"Zoe loves cats, but you love trucks. You are picking a birthday gift for her.",q:"What should you pick?",o:[
  ["A cat toy","Yes! A gift is about what the other person likes."],
  ["A truck toy","Trucks are great, but the gift is for Zoe. She loves cats."],
  ["Nothing at all","A cat toy would make Zoe happy!"]]},
 {m:5,g:[0,1],e:"😢🧸",s:"Noah lost his teddy bear. He is sad.",q:"What could you do?",o:[
  ["Say, “I'm sorry. Can I help look?”","Yes! Helping shows you care about how Noah feels."],
  ["Laugh at him","Laughing when someone is sad can hurt a lot."],
  ["Say, “It's just a toy.”","It may be just a toy to you, but it matters to Noah."]]},
 {m:5,g:[0,2],e:"🐕😨",s:"Ava is scared of dogs. Your dog is very friendly.",q:"What is kind to do?",o:[
  ["Keep your dog back and let Ava choose","Yes! Ava's feelings are real, even if your dog is nice."],
  ["Bring your dog right up to Ava","That could feel very scary for Ava. Let her choose."],
  ["Tell Ava she is a baby","That is unkind. Everyone is scared of something."]]},
 {m:5,g:[0,2],e:"⚽😞",s:"Omar is not in the game. He looks sad.",q:"What could you do?",o:[
  ["Ask, “Do you want to play?”","Yes! Asking someone to join can make their whole day better."],
  ["Pretend you do not see him","Omar would still feel left out. A small invite helps."],
  ["Say, “No more players!”","That would make Omar feel even more left out."]]},
 {m:5,g:[0,2],e:"🎈🙉",s:"Balloons keep popping at the party. Ben covers his ears.",q:"What might Ben need?",o:[
  ["A quieter spot","Yes! Loud sounds can hurt some ears. A quiet spot can help Ben."],
  ["More balloons popping","More pops could hurt Ben's ears even more."],
  ["Someone to laugh at him","Laughing would hurt Ben's feelings. His ears need care."]]},

 // 6 Sayings and hidden meanings
 {m:6,g:[0,1],e:"🛍️✋",s:"Mom is carrying lots of bags. She asks, “Can you give me a hand?”",q:"What does Mom mean?",o:[
  ["Please help me","Yes! “Give me a hand” means help me. You get to keep your hand!"],
  ["Give her your hand to keep","Your hand stays with you. It means she wants help."],
  ["Clap your hands","No clapping needed. It means she wants help with the bags."]]},
 {m:6,g:[0,1],e:"🤐🏫",s:"The teacher says, “Zip your lips.”",q:"What does she mean?",o:[
  ["Be quiet now","Yes! “Zip your lips” means stop talking for now."],
  ["Put a zipper on your mouth","There is no real zipper. It means be quiet."],
  ["Zip up your coat","Your coat can stay as it is. It means be quiet."]]},
 {m:6,g:[0,2],e:"🌧️🐱🐶",s:"Dad looks outside. He says, “It's raining cats and dogs!”",q:"What does Dad mean?",o:[
  ["It is raining very hard","Yes! It is a saying. It means lots and lots of rain."],
  ["Pets are falling from the sky","No animals are falling! It is a saying for very hard rain."],
  ["The dog and cat are wet","It is a saying. It means it is raining very hard."]]},
 {m:6,g:[0,2],e:"🐇⏱️",s:"Grandma says, “Shoes on! Hop to it!”",q:"What does Grandma mean?",o:[
  ["Hurry and put your shoes on","Yes! “Hop to it” means start fast. You do not have to hop."],
  ["Hop like a bunny","You can hop for fun, but it means hurry up."],
  ["Hop to the kitchen","It is a saying. It means get going quickly."]]},
 {m:6,g:[0,2],e:"👂😊",s:"You want to tell Grandpa a story. He says, “I'm all ears!”",q:"What does Grandpa mean?",o:[
  ["He is ready to listen","Yes! “I'm all ears” means I am ready to listen to you."],
  ["He is made of ears","Grandpa looks the same as always. It is a saying."],
  ["His ears got very big","His ears did not change. It means he wants to listen."]]},
 {m:6,g:[0,1],e:"🚶🚶‍♀️🚪",s:"The teacher says, “Line up for lunch!”",q:"What should you do?",o:[
  ["Stand in a line by the door","Yes! “Line up” means stand one behind the other."],
  ["Draw a line on your paper","It is not about drawing. It means stand in a line."],
  ["Lie down on the floor","“Line up” means stand in a line, not lie down."]]},
 {m:6,g:[0,2],e:"✋🐎",s:"You start running to the car. Mom says, “Hold your horses!”",q:"What does Mom mean?",o:[
  ["Wait a moment","Yes! “Hold your horses” means slow down and wait."],
  ["Go find some horses","There are no horses. It is a saying that means wait."],
  ["Run faster","It means the opposite. Slow down and wait."]]},
 {m:6,g:[0,1],e:"🪑👩‍⚕️",s:"At the doctor, the nurse says, “Please take a seat.”",q:"What should you do?",o:[
  ["Sit down in a chair","Yes! “Take a seat” means sit down."],
  ["Carry a chair away","You do not carry the chair. It means sit down."],
  ["Take a chair home","The chair stays there. It means sit down."]]},

 // 7 Playing together
 {m:7,g:[0,1],e:"🛝⏳",s:"You want the swing. Someone else is on it.",q:"What could you do?",o:[
  ["Ask, “Can I have a turn next?”","Yes! Asking and waiting is fair. Your turn will come."],
  ["Pull them off the swing","That is not safe. Someone could get hurt."],
  ["Yell, “Get off now!”","Yelling can scare them. Asking with a calm voice works better."]]},
 {m:7,g:[0,1],e:"🏃🏃‍♀️",s:"Some kids are playing tag. You want to play too.",q:"What could you say?",o:[
  ["“Can I play too?”","Yes! Asking is the clearest way to join a game."],
  ["Grab a kid and yell “You're it!”","They may not know you are playing. Ask first."],
  ["Say nothing and watch from far away","They may not know you want to play. You can ask!"]]},
 {m:7,g:[0,1],e:"🎲😬",s:"You lost a board game.",q:"What does a good sport do?",o:[
  ["Say “Good game!”","Yes! Good sports are kind when they lose. Friends will want to play again."],
  ["Throw the game pieces","Pieces could hit someone. Friends may not want to play again."],
  ["Say “You cheated!”","That can hurt your friend's feelings. Try saying “Good game.”"]]},
 {m:7,g:[0,2],e:"🏆🙂",s:"You won the race at recess!",q:"What does a good sport do?",o:[
  ["Say “Good race!” to the others","Yes! Good sports are kind when they win, too."],
  ["Shout “You lose!” over and over","The other kids may feel sad. They might not race again."],
  ["Dance right in their faces","Happy dances are fun, but not in their faces. They may feel sad."]]},
 {m:7,g:[0,2],e:"🌧️🏕️",s:"The park trip is off because of rain. You feel let down.",q:"What is a good Plan B?",o:[
  ["Build a blanket fort inside","Yes! Plan B keeps the fun going. It is OK to feel let down first."],
  ["Say “No fun ever again!”","Rain can't stop all the fun. A Plan B can still be fun."],
  ["Stand by the door all day","The rain may not stop soon. Plan B can be fun too."]]},
 {m:7,g:[0,2],e:"🧍↔️🧍",s:"A friend is standing very close to you. You do not like it.",q:"What could you say?",o:[
  ["“Please step back a little.”","Yes! Words are clear and kind. Your body space matters."],
  ["Push your friend","Pushing can hurt. Use your words instead."],
  ["Scream at your friend","Screaming can scare your friend. Calm words work better."]]},
 {m:7,g:[0,2],e:"🧱🚂",s:"Mia wants to play blocks. You want to play trains.",q:"What is a fair idea?",o:[
  ["Blocks first, then trains","Yes! Taking turns means you both get to choose."],
  ["Only play trains","Mia would not get a choice. Taking turns is fair."],
  ["Grab the blocks away","Grabbing is not fair. Mia may feel upset."]]},
 {m:7,g:[0,1],e:"🚗🙋",s:"Leo wants your toy car. You are not done yet.",q:"What could you say?",o:[
  ["“You can have it when I'm done.”","Yes! You finish your turn, and Leo knows he gets one next."],
  ["Hit Leo","Hitting hurts. Leo would feel sad and scared."],
  ["Hide the car forever","Leo would never get a turn. That is not fair."]]},

 // 8 Asking for help
 {m:8,g:[0,1],e:"🥛❓",s:"At lunch, you cannot open your milk.",q:"What could you do?",o:[
  ["Ask, “Can you help me open this?”","Yes! Asking for help is smart. Grown-ups like to help."],
  ["Throw it on the floor","It could spill, and you still have no milk."],
  ["Give up and drink nothing","Your body needs a drink. Asking for help is OK."]]},
 {m:8,g:[0,2],e:"🛒🔍",s:"You are at the store. You cannot see your grown-up.",q:"What should you do?",o:[
  ["Ask a worker or a parent with kids","Yes! Store workers and parents with kids can help you find your grown-up."],
  ["Walk out to the parking lot","Outside has cars. Stay inside so your grown-up can find you."],
  ["Hide in the clothes rack","Your grown-up cannot find you if you hide. Ask a worker for help."]]},
 {m:8,g:[0,2],e:"😔🧑‍🏫",s:"A big kid pushes you at recess every day.",q:"What should you do?",o:[
  ["Tell a grown-up you trust","Yes! When someone hurts you, tell a grown-up. They can help it stop."],
  ["Keep it a secret","If you keep it secret, no one can help you."],
  ["Push back harder","Someone could get hurt, and the problem gets bigger. Tell a grown-up."]]},
 {m:8,g:[0,2],e:"🌳🐶",s:"At the park, a grown-up you do not know walks up. They say, “Come see my puppy.”",q:"What should you do?",o:[
  ["Say “No” and go to your grown-up","Yes! Always stay with your grown-up. Tell them what happened."],
  ["Go with them to see the puppy","Always ask your own grown-up first. Stay where they can see you."],
  ["Keep it a secret","Your grown-up wants to know. Telling them keeps you safe."]]},
 {m:8,g:[0,2],e:"👩‍🏫❓",s:"The teacher told the class what to do. You do not know what to do.",q:"What could you do?",o:[
  ["Ask, “Can you say it again?”","Yes! Lots of kids need to hear it again. Asking is smart."],
  ["Guess and hope it is right","Guessing can go wrong. It is OK to ask."],
  ["Sit and do nothing","Then you stay stuck. Asking helps you get started."]]},
 {m:8,g:[0,2],e:"🎉🎧",s:"The party is too loud for you.",q:"What could you do?",o:[
  ["Tell a grown-up, “I need a quiet break.”","Yes! Knowing what your body needs and asking for it is a great skill."],
  ["Scream louder than the noise","Screaming adds more noise. A grown-up can help you find quiet."],
  ["Hide and tell no one","Your grown-up may worry. Tell them, and they can help."]]},
 {m:8,g:[0,2],e:"🩺😟",s:"You are at the doctor. You feel scared about a shot.",q:"What could you do?",o:[
  ["Tell your grown-up, “I feel scared.”","Yes! Saying your feeling helps. A grown-up can hold your hand."],
  ["Kick the doctor","Kicking hurts. The doctor is there to help you stay healthy."],
  ["Run out the door","Your grown-up needs to know where you are. Tell them how you feel."]]},
 {m:8,g:[0,1],e:"🚻✋",s:"You need to use the bathroom during class.",q:"What should you do?",o:[
  ["Raise your hand and ask to go","Yes! Asking lets your teacher know where you are."],
  ["Walk out without telling anyone","Your teacher would not know where you are. Ask first."],
  ["Wait and wait until it hurts","Waiting too long is hard on your body. It is OK to ask."]]}
];
