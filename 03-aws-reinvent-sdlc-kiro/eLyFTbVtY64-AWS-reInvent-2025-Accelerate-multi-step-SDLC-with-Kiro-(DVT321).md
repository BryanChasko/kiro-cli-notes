# AWS re:Invent 2025 - Accelerate multi-step SDLC with Kiro (DVT321)

**Video:** https://www.youtube.com/watch?v=eLyFTbVtY64
**Platform:** YouTube
**Channel:** AWS Events
**Video ID:** eLyFTbVtY64
**Duration:** 01:00:28
**Published:** 2025-12-04

---

## Transcript

So, hi everyone, welcome to Accelerate Multi-Step SDLC with Kiro.
Glad to have you here.
My name is Derek, and with me is Kieran.
And we both work on the developer Agents and Experiences team at AWS.
We both went on the team for the last year, so it's really exciting time to be in the space.
We work with our Agents' Software Development Products, including Kiro.
And then customers all around the world who are using these products to develop software.
Our team is former software developers that are now engaged with other software developers around the world that are adopting these products.
I'm Kiro's show of hands, who in the room is a software developer by profession?
Okay, yeah, at least maybe half, okay.
Who's vibe-coded, whoever's vibe-coded before?
Okay, some of the same hands, some other hands.
vibe-coding is obviously a hot topic using a hydrogen-rate code.
These tools are getting better and better all the time.
And I think vibe-coding is a great start, but the conversation we're having a lot with customers is beyond using AI to do the build step.
How do I use AI at every step in the software development lifecycle and not just the build step?
So that's the purpose of the talk today.
And this is a coding session, so I'm going to do a little bit of talking up front, trying to do too much,
but just want to set the stage for a few things here.
So we'll talk about the software development workflow that we're going to use with Agentic tooling.
And we're going to talk a little bit about how we compose Agents, what they're made up of, how the Agentic loop works,
and how we can configure them in Kiro's CLI.
Very important step before we go into actually using AI for software development workflow.
So we'll do that up front, and then it's quickly as I can hand over to Kiro and who's going to do a bunch of live coding today.
We're not just going to write code.
We're going to start at the beginning of the SDLC.
We're going to do requirements.
We're going to do system design.
We're going to make some decisions.
And eventually we'll write some code, and hopefully we'll have a working game to play by the end of the session here.
Live coding, live AI codeings, always going to be fun time.
So just a level set.
I think any of us could draw a picture of the software development lifecycle, and there's lots of different ways we could express it.
If you ask different folks, love different opinions about which steps there should be, and which order they should be in, and how fast you iterate on the different steps.
But broadly speaking, we need to have a requirements.
We need to do a system design.
We need to plan.
We need to build.
We need to test.
We need to package.
And then we need to deploy and operate.
And when we talk about vibe coding, in my opinion, we're really just talking about skipping to the right code step.
Which can be great for prototyping, or for trying something out, or maybe just scratching in it, in a language that you don't know or something.
But when it's time to actually do professional software development, we don't want to skip steps.
And so the question becomes, how can we use AI for all of these steps?
There are a few approaches for this.
We've got two Kiro products now.
We've got the Kiro IDE, which just went into GA in the last month or so.
And then we also have the Kiro CLI, which we'll be using today.
The approach that we're going to use for the live coding session.
You could use in Kiro IDE or Kiro CLI.
This is really a preference thing in terms of the user experience that you like.
Kiro and I are both a bit of console geeks.
And so we're going to invite you all to be console geeks with us for Kiro CLI today.
So the framework we're going to use is called AI DLC.
And we want to show one way that you can approach this.
This is not the only way.
Kiro IDE has spectrum of development built into it.
And so that's another way that you can approach using AI powered requirements and system design and planning.
AI DLC is another way.
It's a little bit more granular than what you would see in the Kiro IDE.
And this is something that we've actually opened sourced and released on GitHub.
You'll last a week or two.
So we won't go too much into the details of AI DLC.
It's going to be in the background sort of guiding us along as we go through this steps.
But we have a slide at the end that has a QR code and a link.
So if you like what you see and you'd like to try out AI DLC for yourself and some of these prompts,
you're welcome to do so and we'd love to hear your feedback.
So AI DLC roughly speaking has this concept of an inception phase where we're going through the requirements and the design and the planning.
Construction phase where we're doing the building and the packaging and then an operation phase.
We're going to go through the inception and the construction phase today and get hopefully to a working game by the end of the hour here.
So I want to spend a few minutes on agent composition before we jump into the coding.
So this I think is a commonly accepted definition of an agent.
This is Simon Wilson's definition.
An LLM agent runs tools in a loop to achieve a goal.
Very simple.
The simplicity is what we like for today's purposes.
I'm going to modify that a little bit.
And I'm going to say an LLM agent runs tools in a loop while building context to achieve a goal.
And I'll elaborate on that a minute here, but we're finding is managing the context and the tools are critically important to getting the results that we want.
Out of this agentic software development process.
If we skip this step or if we don't get it right, we're not going to get the results that we want.
So this becomes an important step in the workflow to making sure that our agent is configured correctly.
So here's a diagram. Again, an agent.
Agentic loop is nice and simple.
The user, in this case, we're using the Kira CLI.
We're going to ask it to do something as input.
It's going to take that into its context.
We're going to pass it to the LLM to decide what to do about our goal.
The LLM is going to come back and say, I want to take some action using a tool.
We're going to go call that tool, whatever it is.
The tool is going to return the result.
That goes back into the context and we go back to the agent again and we say, okay, we ran the tool.
What would you like to do next?
We'll keep iterating until the agent decides until the LLM decides we're done and we're ready to give a response back to the user.
So let's talk about each of these parts briefly.
Starting with the LLM.
So for today's purposes, we're going to care about applied AI and not the gory details about how LLM works.
So for our purposes today, I'm not going to try and talk about the semantic relationships that are in the model weights and
and dimensional vector space and all that stuff.
I'm sure some of the folks in the room are experts at this stuff.
What we're going to say is an LLM gives us reasoning.
We could debate how it gives us reasoning or the details.
But if we ask it to reason about something, it will do that and it will come back and come up with an approach for a problem.
We're also not going to talk about auto regression and multi-head attention and all that stuff.
What we're going to say is the model has knowledge embedded into the model weights.
What we would call latent knowledge that's been trained into the model during the pre-training step.
No stuff.
How it does the recall will leave for a different session.
But our LLM is going to give us the ability to reason and it's going to have latent knowledge.
Facts that it knows about the world.
So that's great, but next we need working memory for the model to be able to understand what it's doing and keep track of where we're going.
And that's the context window.
So here's a very simplified sort of mental model of the context window.
It's everything that's in the model's working memory.
So starting with system prompts that are behind the scenes, guiding the agent's behavior,
any context files that we've loaded.
We're going to see example of that here in a minute.
The history of our chat so far.
So we've opened up our chat window, we're going back and forth, working on a problem with the agent.
That's all in the context window.
Any source code that it's pulled up and looked at if we're working on an existing project.
The output of all the tools that we've called so far.
And then hopefully some free space so that we can keep going.
It's a managing this context window is extremely important for us to get the results that we want.
If I'm asking the agent to work with some custom library that I've developed and it doesn't know anything about that custom library,
we're going to get a very different result than if I were to load up the documentation for that library into the context window.
So we want to make sure that we get this right up front.
And then finally for this section, tool selection and tool execution.
MCP has taken over in the last six months or so as the de facto standard for tool use with agents.
For those of you who aren't familiar, I think MCP is the USB protocol for agents.
I can take a plug, it'll plug into any agent and it'll let me plug skills into the agent so that it learns how to do something new.
It'll let me give it access to reading resources from another location that it needs.
And possibly give it the ability to take action.
So almost like an API where it can do a mutative or make a change on another system.
And so getting the MCP tools right again is another critical piece of getting ready for us to go do our agents at software development.
If we need access to JIRA, if we need access to our internal wiki, if we need access to go search the internet, we need to make sure that any of these tools that we need are plugged in.
So we talked about the agentic loop and how having the right LLM model to do reasoning, the right context window content in order for it to have that in its working memory what it needs to know.
And we talked about having the right tools plugged in.
These are all the ingredients to having the configuration that we need.
So today we're going to be using Kiro CLI to do our live coding session.
And in Kiro CLI we have this concept of a custom agent.
And the custom agent is really a bundle of all of those things that we can store.
We can share with our teammates.
We can publish internally if we want other teams to be able to use it.
We could just save it for ourselves.
But it gives us the ability to combine our model selection.
What context we want in the context window system prompt static resource files hooks which give us the ability to do some dynamic context.
And then tools which MCP servers do I want to be using.
Within each MCP server that could be exposing multiple tools which ones do I want to allow the agent to use.
Maybe not all of them.
I want to give them different names.
So all of this goes into one file which Kiro will show us here in a minute.
That lets us build our custom agent.
So we're going to do that first.
Kiro is going to walk us through building our custom agent.
And then we'll come back briefly and talk about what we're going to go build.
So with that.
Kiro.
Overdo.
Thanks everyone.
Let's work yet.
The joys of alive demo.
Yep.
Good fun.
I saw a flicker.
Yeah.
I've worked two seconds before we started as well.
I've worked two seconds before we started.
Yeah.
There we go.
Reboot.
Okay.
All right.
So the first thing.
Hi everyone.
So the first thing we're going to do today is configure the custom agent.
And so you can see exactly what Derek was talking about on those slides.
So diving right in.
I'm just going to go straight into Kiro.
There we go into the Kiro CLI.
And as Derek mentioned, we have an IDE that you can use as well.
But for the purposes of this, we're going to use the Kiro CLI.
So the first thing we're going to do.
I was going to configure our custom agent before we actually go ahead and build a game.
So in order to do that, I'm going to go.
Agent.
Let's start the agent start.
We've got.
So when you first start off, you have a Kiro default agent.
You can see they're in green.
And then I've got a flappy Kiro agent here that I've built specifically for this demo.
But if you want to build your own, you just go.
Agent.
Oops.
So it's agent.
And then it's create.
Give it a name.
And we're going to call this demo.
Agent.
One.
Now this is your agent configuration file.
This one's empty.
I'll show you the populated one in just a second.
But this is where you configure all those things.
Derek told you about your MCP servers.
The tools that your MCP servers have access to.
And we should have called out the acronym on first use.
I don't think we did.
And model context protocol.
The tool aliases, as Derek mentioned.
In case you want to give those different engineering name.
The tools that your agents are allowed to use and the different resources.
So what we'll do is we'll quit out of here and show you.
What that looks like.
Oops.
I forgot the prompt sat here.
I thought I had it.
Derek.
Oh, one.
There we go.
Sorry about that.
So for this particular agent,
we've got a couple of MCP servers configured.
So I've got a mermaid MCP server.
So that's going to help us build diagrams for the requirements.
And the business requirements that we're going to do.
As well as the implementation plan.
I have a fetch MCP server to go and fetch things off the internet for us.
And that's because when we build the plepic hero game.
I wanted to be able to go and fetch AWS services from the internet and use that instead of normal.
Fluffy bird game.
And make that a little bit more interesting.
Maybe use a Halloween and a Vegas type theme.
So I've got some tools that I've got loaded here as well.
Some resources and read and write tools as well.
And the reason for not putting old tools that the MCP server has access to is as Derek mentioned.
You've only got a certain amount of space in your context window.
So you don't want to overwhelm the agent with tools that it doesn't need.
So I've locked it down just for specific tools for to do that with.
And then I've got under the resources the AIDLC workflow.
And as we mentioned, we'll link that in a QR code towards the presentation.
But it'll give you a list of all the different components of the AIDLC.
And all the different questions and answers and how it all works throughout there.
So I'll tell the agent to be able to access that as well for the purposes of building this out.
And then hooks, as we mentioned earlier, that's something for you to for it to the agent to take action on.
So really good for sort of CICD pipeline type things that you might be doing.
We're not going to do anything for that in here.
We're just going to focus on using the MCP servers and the AIDLC and the resources can be good with that.
So with that, I'm going to switch to my agent.
And we're going to select that one.
And that's going to give us the agent that we're going to use to actually build out the game.
So yeah.
Thanks, Karen.
And you know, just to emphasize, this is a relatively simple thing to configure.
But by pulling in those resource files, we're going to dramatically alter the behavior of the agent.
As you'll see in a minute here from what we would get by default.
And so there's a lot of power under the hood that we can have here.
We're developing custom workflows, specific ways that we want the agent to work.
And that's something that teams can work together on and refine over time.
And we're seeing libraries of these emerge within customers as the different teams,
kind of maybe build their own repo internally, just to refine these files,
get these better and better over time.
So there's a lot that you can do here by just loading in a few context files and a few tools.
So we're going to spend the rest of the time here building.
And the goal here is to build a game called Flapicuro by the end of the session.
We'll see how it goes.
It's live.
So we have some backup plans in case things.
We have some kind of problem, but I'll try not to jinx this here.
Flapicuro is a game where the go, I think his name is ghosty actually.
Okay.
So ghosty is going to be able to scroll through a side scrolling game.
And when we push spacebar, he'll flap up in the air.
When we let go the spacebar, he'll drop down and he's got to avoid obstacles and get a score.
The point here is less about the implementation details that we pick or what language or hopefully the game actually works.
And whether it's good or not, what we really want to do is focus on the workflow.
And focus on how we can use AI from the very beginning to help us get our requirements and our design and our thinking about our plan and our testing and everything that we need to do in order to build production grade software.
So while we're not building production grade software today, we're going to sort of speed through some of the steps.
That you walk away today, maybe inspire a little bit to try some of these techniques yourselves and try doing an end to end, you know, task or story from your backlog using this process and using AI from the very beginning of your project.
Anything else I should do to tee a plappy caro here, I think it's a pretty straightforward game and we'll get into some of the details.
Yeah, we're going to try and get it to work on here as well as a mobile phone, so we'll switch to the development tools and see if it works on a mobile, but try and get to work first and then we'll go from there.
All right, let's see how we get on.
Okay, see if this works. Oh great.
Okay, so to build this, we're going to just use one prompt, so this is the prompt I'm going to use, we're going to walk spend a little bit of time going through it.
So the goal is not to do any prompt engineering or have any secrets or spirit baked into this, we're going to have one clear prompt and then we're going to go through the AI DLC process, which has been shortened to fit into the session today.
So the first thing we're going to do is we're going to use Derek mentioned in the presentation, a lot of the LLMs trained, you know, a latent knowledge that it's got when it was trained.
So a lot of this, it's aware of and it can actually make a lot of assumptions based on this, but we still want to guide it with proper requirements, business requirements, you know, functional requirements and functional requirements and then implementation plans.
So the first thing is, I'm going to say, I want to build a browser based game called Flapicuro for a live demo at AWS reinvent.
We're going to follow the AI DLC methodology and workflow and we're going to ask the LLM to ask us clarifying questions, so that it can then provide the answers as inputs for each phase.
I want to show you some mermaid diagrams, so when it actually builds out the far structure and the implementation plan, you can see what that looks like and if you look in the IDE, it actually gives you a really good visual of that.
Because we're doing this in the CLI, I'm just going to use a mermaid webpage that we've got and we'll show you all the architecture diagrams that it does.
So we've streamlined the process, obviously to fit into the session today, when we run this with our customers, it's usually a one day workshop sometimes too, but we're going to get this to work in 45 minutes.
And then we're going to maintain interactive questions and answer throughout the process and we want to save the files in the working directory so it doesn't put it everywhere.
So I'm being quite specific with it, but we still have to, we're still going to do a quieter guidance and give it the themes and everything like that.
The question was, are we using questions as you go?
Take questions that we go.
I think while the agent is thinking, I think we'll have some time.
Yeah.
Especially through the bill phase, it takes a good five, seven minutes.
Yeah.
It can be two then.
Okay. So we're going to go ahead and execute this and English cost.
So the first stage is going to be the analysis phase or we're going to gather all the requirements.
And in the real world, this will be your business requirements that you might have within your organization.
I give this agent permission to do that.
So it'll be things like, you know, what sort of third party systems do you need to use, what sort of logging or anything like that that you might have if you have any security
postures that you need to follow, things like that, that will be part of your business requirements.
So here we go, it's going to create it a, and I will make this bigger.
If anyone has any suggestions, we can take them as well as be go through this, although it'll just be me filling these out as we go along.
And as Derek mentioned each time we run this, we get a slightly different result, so it's not always the same.
The questions do come back a bit different, but when you use the full AI DLC, you get very specific and then you tend to get the correct response.
Just to elaborate if I can, Karen.
Yeah.
I think what we find is that the frontier models, the LLMs, they're eager to please, right?
And so if we're vibe coding, often the model will sort of take what you've asked it to do and start running with it and start building stuff,
rather than sort of stepping back and thinking critically, like maybe a senior engineer might step back and say, hey, before we build this,
I've got like 15 questions about, hey, what did you think about security?
Did you think about this, you know, what about this edge case, right?
And that's kind of the conversation that we want to be having.
And so really, what we've got loaded into the context here is a lot of specific instructions saying, hey, don't skip any of these steps.
If we don't know the answer yet, let's get the answer before we keep moving.
And so the first step here where we've told Kiro, hey, I want to build this thing is, okay, I've got a bunch of questions.
Please answer those for me before we continue.
So we'll fill those out here, but it should keep asking us until it's clear.
Yeah, exactly.
Yeah.
And these questions are predefined ones.
This isn't like a final list.
If you have something when you're doing this for an enterprise app, you can go and actually put those in there.
So there's a question you feel that your hasn't, you know, met your organizations needs.
That's something that you can just insert in there too.
It doesn't have to be, it won't freak out.
And I'll show you an example of that.
So the way I answer these questions, I'm supposed to fill them in down here.
I'm just going to say yes, no.
And then for this one, I'll fill them all in down here for question two.
And we'll go through it like that and see all the agent deals with that.
So the first question, we wanted to continuously fly.
And it says all only when clicking, when pressing the, with space bar.
So I'll say, yeah, press.
I'll just say a button.
Press button to fly.
And then for the easy difficult, easy medium or hard.
I'm going to say easy has large larger, yeah, it's a large larger.
Optical gaps, getting harder as the game progresses.
There we go.
And should the game speed increase over time?
I'll just get that a flat yes.
This takes quite a bit of time when you're building out an enterprise app,
but I hope it will get through this quite quickly.
So then we get to the visual size of this too.
So what I want to do is I'll change this a little bit.
We're going to use maybe some of the AWS colours.
I'll go with orange and black.
I'll go with a Halloween theme.
I think it's recently Halloween.
And say Las Vegas theme as well.
Let's see how it deals with that.
One at a time was there.
Do you want the Kira character to be a simple shapes, bright, or custom design?
So Kira is a ghost.
So we're going to use a purple, purple, ghost character.
Should the obstacles be classy?
You know, the classic, obviously it's got that late in knowledge.
It knows exactly what that game is.
So let's go with AWS themed.
And it's got that from the prompt that we did with saying that we're doing an AWS reinvent presentation.
And then we want to say use say AI and coding services from AWS.
There we go.
And then scoring in leaderboard.
We're kind of scoring features which you like.
I'll take suggestions if you want to shout them out too.
I'll go with all these.
So simple score.
Or do you want to use a leaderboard.
So we'll just go with simple for now.
And then here we're just going to use local storage because we don't have anything like that configured.
And in the real world, obviously it's looking for, you know, if you're using an API gateway,
you need something like cloud front.
If you want this game to be globally available,
close to your customers in different regions.
That's something you'd specify over here.
For the purposes of this, we're going to do this.
We'll say yes to that.
And then how long do you want it to be?
I'll just go one to two minutes.
And I'll say yes to that.
And on a mobile phone.
Test that towards the end.
I like the ambition level here.
Yeah.
You're having a lot of features.
HTML and Java.
Let's use those two for this purpose of this.
Single file.
I think we'll use multiple files because I want to have proper structure for this.
So in case we need to go back and change something,
or we want to document any of these decisions and come back and ask why we did that.
It's all nicely documented.
So go with multiple files for that.
Yeah.
Good catch.
It's pretty good at picking up all my bad typos.
So I'll see how it deals with that one.
I'll leave it alone.
Any AWS services want to showcase?
Anything to do there?
I don't think it knows about curiosity.
It's got that MCP server to go and fetch things like that.
I'm a proud workmail user, but it's probably not.
Workmail.
So I'm not appropriate.
Yeah.
Sorry.
Amplify.
Do that.
Let's see what it does there.
And I'll put maybe bedrock since it's going to be running on that.
Okay.
Let's try those.
And then start string instructions.
Say yes.
We're just suggesting for Amplify and bedrock.
Maybe just make a note that we need a way to test locally.
Okay.
Since we're not going to have to find time to deploy to an AWS environment.
Yeah.
Cool.
All right.
Restock button.
I'll just say yes.
And then we'll move on to the next one.
Mobile support.
Support for mobile browser.
So I think.
And then maybe want to use maybe Chrome and Firefox.
So I think there are two common use ones.
Chrome and Firefox.
Okay.
Great.
And that's it.
So we'll go ahead and save that.
Close that up.
And then we can say.
Done.
And again, we're still using that single prompt.
And it should now go ahead read those answers and come back and start building out the design phase.
And the whole process of this is we're bringing the agent and the LLM into the decision making process.
So yeah.
So about that, saving a lot of time.
And just to note that we were just doing a lot of.
What I would call classic product manager work unless software development.
But it's a very important obviously.
And one thing that we're finding is that.
Getting together cross functional teams that maybe not might not work together next to each other day by day.
But getting the product managers and the stakeholders along with the software developers.
Maybe QA ops.
Right.
Getting that cross functional team that's going to be responsible for this thing.
Sometimes physically together, or at least on the same call.
And working together on answering these questions can help teams get this right up front.
And skip a lot of back and forth that we might traditionally do where we need to email or cut a ticket to someone to find out.
And so if we're able to do this collaboratively up front, we can dramatically cut down on the time needed for us to get all of this right.
And the agent in this case is really our helper to make sure that we're documenting it properly.
Yeah.
Thanks.
So now we've moved moving on from what to build.
And now we're going on to how we're actually going to go ahead and build that.
So it's taken some of the suggestions of SageMaker, amplify us so that they're in bedrock.
And now it's going to come through and ask us how are we going to do these.
And if you think about these and now you're more technical requirements, we've defined the business requirements in the first phase.
We're moving on to the more of the technical stuff right now.
So early on in here, it's given us using that agent that we can figure.
We told that to have the Mermaid MSP server.
It's gone in and actually built out some Mermaid diagrams for us.
So I'll show you what that looks like.
Hopefully that looks good on the screen.
There we go.
So it's actually already documented and drawn out what it thinks this is going to look like.
And do you remember that one prompt?
Do you want everything in a single file or do you want to split up?
And it's going to hit and split that up for us as well.
It's specific files for different things.
So we have JavaScript files and HTML files.
So you can go in and make changes later.
So this is really useful for things like that too.
Sorry.
I'll get back there.
Okay. And then if we look over here.
So let's have a look at this one here too.
It shows you the different components.
So we've got hope it here.
Sorry, I'll lift my muscle home.
What a bit easier with that.
There we go.
So it's showing you the different layers.
It's going to build out and how that's going to look.
Look at on the screen.
Go a bit bigger.
So we find this really, really useful.
Customers have told us that this saves a lot of time with the documentation.
And how that's going to look.
And they can use that for all the different change controls.
And when they submit tickets to have this all built out.
So we're getting all of that.
You can remember I said local storage early.
We're not going to deploy that to anything else.
So that's kind of there.
We already talked about how we're going to do the obstacles.
It's going to fill all that in the scoring.
I said do that as we pass the obstacles.
The difficulty controller from the easy medium and hard.
So all of that's all in there already.
Okay.
So let's go back in and fill out that.
Fill out the rest of that for the technical requirements.
Okay.
So the first question is which AI coding services did appear as obstacles.
So I'm just going to say use all and use them randomly.
How should the difficulty levels differ?
Now I found building this our testing this is it usually the gravity is way too strong.
So the board just falls like a stone no matter how quickly I press this base bar.
And the gaps are way too short.
So I can never get past the first couple of hurdles.
So I might go in here from my previous knowledge and tell it to be to be a little bit better with that.
So I'll say start slower logic gaps and less gravity.
And then I want to use 60 frames per second.
And then now we've got the visuals.
So shall I generate a simple CSS canvas or do we have any image assets?
I start with a normal simple CSS canvas.
But then you can go back in download specific assets or any audio images that you've got for the game.
And you can put that in.
But it does a pretty good job of filling just coming up with stuff itself.
So we'll go with CSS.
And then ghost animation.
Do you want to static bobbing, flipping wings.
Let's animate the ghost.
What it's applying.
Let's use official AWS icons.
I don't think it's going to be able to do that.
And this will give it to them.
But it's going to try and draw them up.
Typically using mode uses something like that too.
Sound effects.
I'll just say use.
Oh, suggested effects.
Discup interest of time.
Here we go.
And then this question.
Yeah.
The bedroke integration.
How should Amazon bedrope be integrated dynamically.
AI power difficulty adjustments.
General rate.
What do you think?
This is going to be interesting.
I think those are all future future enhancements.
Yeah.
Yeah.
Probably doesn't matter for this demo.
Yeah.
And then here's the file structure that it's going to go ahead and create for you.
So instead of creating that one big file, he saw that diagram.
It's going to go ahead and break these down for you in the different files that you're going to use.
And that means you can come back in and put in your own images and your own sounds when you want to do so.
I'll just say.
Okay.
And I hope it's set by.
So again, we're almost kind of like speed running through the steps and almost five coding in a way right by not engaging more here and doing a much richer discussion in the interest of time.
But, you know, again, I think you can imagine.
This is where, in my opinion, the interesting work is going to happen is around these decisions that we're making around technology selection.
And what should we do first and what can, you know, what's a P0 versus a P1 feature and what's our architecture going to look like, you know, this is where we as humans should be spending our time.
And if we get this right up front, the actual implementation phase is almost the easy part, hopefully, because we've already done all of this hard work up front.
And so if you're not already, I would encourage you.
If you try to add you'll see, you know, spend a good amount of time up front in these phases.
Get this as refined as you can.
And then see how the implementation step works out for you.
Yeah.
So we'll link at the end to the GitHub repo, but our teams have put a good amount of work over the last few months.
Again, working with lots of different customers to refine this.
We're using conditional context loading because we have a finite amount of context window space.
There's an initial context file that we loaded.
That kind of kicks off things with the agent and tells it, hey, you're using this workflow.
You're going to use these various specific steps.
And then depending on what you're doing, if you're doing green field or if you're extending an existing application,
if you want to do microservices, there's a bunch of decision trees that it'll make and say, oh, we're using it.
We're going to extend a legacy application.
It'll actually load in additional instruction sets to make sure that we're doing things in an orderly way.
So there's a lot behind the scenes here that's getting loaded in as needed.
Yep.
Yep. There's just the one marked down file is the entry point.
And it has instructions that says, conditionally load these other files depending on what you're doing.
We found that approach works well to keep the context window, not too busy.
Yeah.
And then to your point, the other thing you can do is you can have different agents for different phases of your development as well.
So if you're doing front end development back end development, you can have different agents with different MCP servers, different resources.
And that way you can just switch between those agents as easily as I showed you there.
Yeah.
And that way, that's a good way of getting a project done without loading everything up.
So yeah.
Okay.
So now this is the part where we move to the actual implementation phase.
It's 11 written any code yet, but now we're going to, you know, this thing you can start having it, you know,
georeticates for you and you can have your junior developers go ahead and run this based on the architecture diagrams that your senior developers or
Kero has built for you.
So again, we're just going to go through these real quick and see what we can get from all of it.
So a proof to implement.
Yes, we're just going to go through the the reservation size, link all the modules together.
And then here, if you have any specific styling that your organization might use, this is a, you know, a good place where you can do that.
And if you're building an enterprise app, so that's something you can do there as well.
And if there's anything, you know, you'd be sitting with different teams across your business going through all of this and figuring out, is this the right thing to do, but it's not captured in here.
You can obviously add it in there and change some of those files as well.
Then we go through that as well.
Yeah.
So we are going to use JavaScript and HTML.
I think we decided that was going to be the best thing.
So we're going to go ahead with that.
It's just asking for that final verification before we do anything.
Yep.
There is a GMCP and so I was just thinking the same thing.
Once you get to this step in the real world, each of these might be more complicated and take more time.
So you can imagine each of these becoming a story that goes on to the gerabord and gets pulled down for sure.
That could be as simple as us taking this file and saying, go, go create gerastories for each of these.
Yeah.
I'll be honest, this is different from the other ones that I've done before.
Normally it's another bunch of questions, but here it's just basically saying you've provided me enough.
And just give me the verification for that.
So just answering yes.
Well, I'll have a look at this diagram that it's given us.
This should be the implementation diagram.
I didn't grab everything that I have for some reason.
I thought I had it all.
Yeah, I did.
Didn't like that.
I'll try it once more.
I suggest here in the interest of time that we,
yeah, we are.
Okay.
And you can see when it gets to this part, the agents are really thinking about how it's going to generate the testing.
So it's going to have functional testing and any sort of unit testing and stuff you might want to do for your code.
It'll generate that in the next phase too.
But it's already thinking ahead how am I going to test this into end.
You know, this is quite a, you know, obviously the different I've said to it use five box and chrome.
Because it's going to go on mobile phones.
It's figured that some people are going to have iPhones and it's put Safari in there as well, which is great.
Chrome mobile chrome desktop.
So yeah.
So we'll go ahead and save that.
Okay, now it's going to go ahead and create all the different files for us to actually build a project.
And there we go.
It's going to create the assets file, the CSS files, the JavaScript files, and hopefully we'll get it working again.
So this is where it takes a few minutes.
Five or seven minutes.
It works.
And we spent a lot of time on requirements, design, technology selection, not coding, right?
We've got 16 minutes left in the hour.
We'll see how we get on.
But again, it's just sort of the almost the opposite of, of vibe coding and starting with build.
And this was really the, the thing that we wanted to impart is it's, it's time well spent doing this up front.
A ideal C is one framework.
Again, there are other approaches.
You could build something yourself.
You might consider forking what we've got.
You might consider, in fact, send us a merger request.
If you find a way to do to improve on the process.
But the idea is to have a plan going into the, into the process.
Yeah.
To summarize the question, is this process.
It's been linear, right, where we do all these steps in order.
And in reality, in real life, we might start implementing phase one and say actually I changed my mind.
I want to change tweeter requirements.
I think you certainly can go back to one of the previous stages.
Edit the requirements and then ask the tool to update the design for example.
I don't think I have any, any real shortcuts for that.
I think we've got to pay the price at some point.
If we, if we want to change the requirements, we're going to have to go through those steps again.
I think that the, by getting the right people in the room up front.
We can hopefully minimize that, that back and forth,
in terms of what the requirements should be.
In terms of iterating on the design and the implementation.
One of the benefits is we can move pretty quickly here.
And so the iteration step, whereas in previous lives, that might be like a whole sprint that we just used to build something.
We've got to start over again.
We could potentially make that cycle time quite a bit shorter.
But I don't have a way around, you know, needing to go back and, and.
I know it's trying to go back.
So I thought that like, if you really think of this game, document what you did, that I'll look at the change in our mind.
And then, like, we're looking at the, you know, specific, self-harmonic changes, specific changes.
So it's like, like a cycle process.
Yeah.
So just to repeat the question, the question is about.
Being able to save the context and go back and edit it later and be able to iterate based on what we've learned so far.
So we're writing all of the design decisions into, into Markdown files.
All of the Q&A and all of the descriptions of the requirements and design and such.
There's also an audit log that automatically gets written of all the questions and decisions that were made.
One thing that we've seen is just taking all of these files and attaching them back into the jurisdictions.
And so anybody that wants to go back and understand why do we make this decision or, you know, what was used to, as input here, we can go back and reproduce it.
We've also seen, you know, the context window can get full.
And so in between each of these steps, we've actually cleared the context and then started fresh again.
And that kind of proves to ourselves that everything that's needed to reproduce what we've got is stored in these Markdown files.
Yep.
And that's in our custom agent.
Yep.
And so in theory, we should be able to go back to any step in any time.
Use one of these as artifacts.
Make a tweak and move forward from there.
How does this take place for us using the power of our IDV?
Because I use it and it follows very similar phases where we have the design requirements and tasks.
And here you have the analysis design.
Do you think one is more powerful than the other?
Or depending like if we use it, you would dig your own best intelligence.
And in that case, we would first be more powerful than the spec.
The question was, which is sort of the better approach.
Care ID has spectrum and development.
We're doing this ADLC workflow in the CLI.
They have similar bits of functionality.
We're moving fast in all of this.
The IDE, I would say, spectrum and development is less customizable at this point.
But you're going to get what you get.
And for a lot of customers, they really like it and they're using it.
This is much more configurable.
The ADLC approach or an approach like this gives you the ability to tailor this process with your developer.
Development teams over time and make it as granular and specific.
Always do it this way, don't do it that way as you want.
In return, the process is more complicated.
It's going to take more time.
We're skipping a bunch of steps.
If we were going through the full thing and we hadn't told it, we were doing a demo.
It would be documenting tons of user stories and asking what personas should we be doing.
So it'll go a lot deeper than this.
And so I would suggest that maybe as a starting point or for features that are a little bit more.
I don't want to say straight forward, but I would say a clear IDE is a good starting point.
But if you're looking for more ability to customize or the ability to get a few levels deeper into the requirements,
I would suggest that this is a good approach.
But I also think that you'll see you over time.
We'll continue to build out that spectrum and workflow in the IDE.
And that'll get more and more features as well.
How are we doing here?
I built quite quickly.
There was no contention on Bidrock.
I think we're good there.
I might have to see if it works.
Yeah, well that's.
So it did build us a implementation plan.
And then let me close that down and bring up the other ones.
You know, all the coding was complete.
You get a full report of everything that was done.
How much code was written.
All the features that were implemented.
The stuff that we walked through in the beginning.
And yeah, tells you how to test it.
And it also gives you a whole testing plan as well.
This is quite a basic one, obviously.
But you can obviously imagine what it will produce when you do a proper document.
So yeah, with that, let's see what happens.
I think it's just this file here.
We can go.
So there we go.
We got the start screen.
Look, they're not so far.
This is the worst part.
Easy.
There we go.
I think it wasn't too bad.
Okay, nice.
The bedrock thing that wasn't as impressive as I thought.
I think that's a pack man goes there.
Yeah, it doesn't actually look.
But it's picking up scores.
I don't know if there's any sound on that.
I think we said no sound.
But they should have been, I can unplug my mic in a sec.
Oh, no.
I mean, when we set up the stage.
Yeah.
That was our mistake.
That's actually better than I thought.
Yeah.
A lot of them just didn't work.
It just sunk like a stone.
Cool.
Nice.
We've got eight minutes.
Happy to take more questions and discussion about the process.
Also, I'll be to take a modification request to the game if we want to try that.
Yeah.
Yes.
I will put that up right at the end here.
I'll do some crowd work here.
So our team recently did a test where we didn't full-care and just had it kind of go crazy
and make a whole web app.
My issue with that was that a lot of it was like an accessible.
And like had like there was like window to open things and things like that.
And I'm just wondering what recommendations you have.
Like, is it like adding a front end MCP to the front of it?
Like, what would you recommend to help make sure it kind of followed.
We'll connect guidelines.
Excuse me about accessibility like A11.
Yeah.
Okay.
How specific were you at the beginning about your accessibility requirements and what was must have nice to have?
I'm not sure.
I have delegated this.
I got it.
So I think that would be my answer.
Right?
The more time we spend up front.
If this is a web app talking to the UX folks, the stakeholders, the product managers,
getting really into the weeds on what are the non-negotiables for accessibility.
And if we can get all of that, you know,
decide it up front and document it into one of these markdown files.
I would expect that we would get, you know, better results there.
Is there a way to like, there's like a black tag guidelines?
Like, is there a way to like more easily integrate that even?
Just as a base.
There's this like actual specs and whatnot.
Yep.
So, you know, one thing as you're developing your, you know, version of this for your teams.
Again, you could imagine having a repo of these context files.
And a custom agent that you publish for the teams and say,
use this when you're building a web app.
And in that custom agent, in the context, you could say,
the following or kind of company standards for accessibility is like,
how should I make sure that you hit these versions of these WCAG requirements.
The model is going to have a pretty good understanding of those requirements,
baked into its latent knowledge.
But if you wanted to really make sure that you nailed it, you could say,
hey, I'm guessing I would be willing to wager that there is a WCAG,
MCP server where you can go, where you can go and grab the actual spec.
So, that would come at the cost of more context that you'd have to load.
But you could imagine saying, hey, as part of our verification,
I want you to, I want you to make sure that you've built all of this in and actually go test it.
So, you think you'd get a sophisticated as you wanted to.
And, you know, I would suggest starting by adding that up front into the context
and having it build that in.
Thanks.
That one over here.
Yeah.
I work as a manager of developer experience team,
our company and we have like 300 engineers as a whole.
And one of the difficulties that we have is like,
how are we standardized the AI knowledge,
because people like to use heroes.
Some of those are like to use cursor or cloud code or whatever.
And when I look at these, it's kind of like a bit more considerate.
On Kiro, like, how is the difference with like,
age it's MD, for example, that's kind of like a standardization independent of the tools.
Like, that's, that's a little bit of my question here is like,
how can we make that reusable,
instead of the tool that developers choosing,
so probably making easier to adopt.
Yeah.
So we're seeing a lot of innovation in all of the tools in this space.
So things are moving fast.
Agents that MD seems to be a de facto standard that's emerging.
That's good.
The different tools have different ways for specifying,
you know, this concept of custom agents.
This workflow, the AI DLC is just a bunch of markdown files.
So it would work fine in cloud code or cursor or what have you.
So this isn't meant to be specifically tied to Kiro.
We think that Kiro is a great platform for doing this,
but we're not trying to sort of lock it down to one particular tool.
But ideally, you're able to bundle together the AI DLC or the context files that you have that you want to steer the behavior of the model,
as well as your list of NCP servers together,
and have a way to publish that out to other folks in your organization.
So with Kiro CLI, that's just a JSON file.
And so that all that could be is an internal repository where you say,
hey, if you're building web apps, use this custom agent.
If you're extending this old legacy app, go use this agent.
And that combined kind of collective wisdom of how to operate around those different domains is baked into those agents.
Yeah.
Guess so one more.
Oh, come over to you next.
First of all, thank you for that great presentation.
When you have these different stages in the AI DLC,
and in the agent definition,
there was this line model that was null.
So you leave the selection of the model to use to the automatic,
or would you suggest using different models for different tasks and stages in the AI DLC?
Yep.
Thanks for the question.
So by default, we now have an auto mode in Kiro,
and that's going to allow us to select the model and give you a discount in terms of credits.
And our goal with the engineer and team,
and there's been a lot of energy on this,
is making that auto mode work great,
and you as a user would never have a reason to change the model,
because you're very happy with the outcome.
So that would be our recommendation.
Start with the auto mode, hopefully you get great.
If you're not sure you're getting great and you want to say,
no, I definitely want Sonic 4-5 or whatever the latest model of the day is,
you could switch to that and see if you get different results.
But our hope in our expectation is that you can start with just not defining the model,
use the default auto mode.
Yep.
I want to take one more here, and I know we're just wrapping up on time.
So first of all, thank you so much for the presentation at demo,
and I just tried to Kiro app and also the CLI as well.
They both work really fast.
I really like it.
Great.
I like the broader.
But the things are, you know, I know a lot of independent developers.
They try to show me like AI coding agent, cursor, cloud code.
So actually, I want to get more insight that,
how to differentiate from Kiro and those not a coding agent.
For example, are we going to have more integration on AWS or, you know,
to some more integration work on enterprise integration?
Yep.
Yep.
Thank you.
We're right at time.
But I'll say, in terms of differentiation,
we want care to be a great product regardless of where you're developing,
even if it's not a native US.
And so our intention is to just focus on a great developer experience.
Of course, we want it to be really good at AWS as well.
So that's the thinking.
You know, differentiators.
There's a lot of smart folks that are building other cool tools in this space.
I think it's a good time for end users because that competition is,
is having folks kind of leapfrog each other in capabilities.
I expect that's going to continue to happen.
I'd say one nice thing about Kiro is when you subscribe,
you have access to both the CLI and the IDE for one subscription.
And we see a lot of folks that like to switch back and forth between those modes,
or maybe even use both at once.
So I think that's a nice thing.
I would say the spectrum and development in the IDE,
which we didn't look at today, but we've heard a lot of great feedback
that that's a good way for developers to sort of structure their approach.
So I would encourage you if you haven't to try both.
Try the spectrum and workflow in Kiro IDE.
Try the AI DLC, which is a bit more in depth,
and see which one suits you the best.
So very brief answer to your question,
but I know we're right at time.
All right?
Thank you all.
Thanks, Kiro.


---

*Transcribed using OpenAI Whisper (model: tiny)*
