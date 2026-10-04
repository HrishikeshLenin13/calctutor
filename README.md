# CalcTutor

I kept losing the thread in class. The teacher was already on the next key, and I was still looking for the one before it. CalcTutor is the page I wanted in that moment.

You type the problem the way you would say it. The calculator on the page presses the TI-84 Plus CE keys for that problem, and the screen is the calculator's own screen. Watch it once, then press the glowing key yourself.

Spelling can be off. `fnd the zer of x^2-5x+6`, `x2 - 5x + 6 = 0`, and `zero of x^2 - 5x + 6` all walk the same zero and land on **X=2, Y=0**. `avrage of 2, 4, 6, 8, 10` is 1-Var Stats. `less then 1.96` is the left tail. `sin30` is taught in degree mode, because the class answer is 0.5.

## Two ways to follow

**Watch** plays every key at a pace you can read. Arrow keys move a little faster. It pauses when a new step starts, then stops on the answer.

**You press** waits. Only the glowing key advances the lesson. A wrong key does not change the calculator. It just tells you the name of the key you actually need.

Three buttons sit under the box for the problems that come up every week: Zero, Average, and Area.

## What you can type

A sentence is enough. These are the kinds of problems it will walk:

- A zero, a minimum, a maximum, or an intersection. `vertex of x^2` reads **X=0, Y=0**, not a pile of scientific dust.
- A normal area. `area between 1 and 2`, `from 60 to 80 mean 70 sd 5`, `P(Z < 1.5)`, `less than 1.96`.
- A percentile. `95th percentile` is invNorm.
- A list. `1-Var Stats of 2, 4, 6, 8, 10` shows the mean, the sum, and the sample standard deviation.
- A line. `linreg (1,2) (2,4) (3,6)` is LinReg(ax+b).
- A binomial probability. `binompdf n=10 p=0.5 x=3`.
- A degree trig value. `sin 30 degrees`. `sin(pi/2)` stays in radian mode and equals 1.
- A plain calculation. `2+2` is 4. `square root of 144` is 12.

If the sentence is not a math problem, it asks for the math in one line. It will not invent a key sequence for "hello".

The line under the box shows how the problem was read, so a typo correction is visible. `fnd the zer of x^2-5x+6` shows up as "Zero of x^2-5x+6".

## Same menu numbers as class

This part matters, because a wrong option number is how you get lost next to a real calculator.

- ZOOM **6** is ZStandard.
- CALC **2** is zero, **3** is minimum, **4** is maximum, **5** is intersect. Each one asks Left Bound?, Right Bound?, then Guess?.
- STAT CALC starts with the cursor on the list name. **1** is 1-Var Stats. **4** is LinReg(ax+b). **8** is LinReg(a+bx). Option 3 is Med-Med, so the regression is not option 3.
- DISTR follows the CE order. normalpdf is 1, normalcdf is 2, invNorm is 3. **binompdf is A** (the math key). **binomcdf is B** (the apps key).
- A degree sign is 2nd, APPS, 1. Quit is 2nd, MODE.
- The negative key, (−), is not the subtract key. `⁻X^2` is −(X²). The x² key is the usual way to square x.

A few menu rows are only there so the numbers stay honest. They do not pretend to run Med-Med or invT.

## The calculator by itself

[/calculator](http://localhost:3000/calculator) is the same keypad with no lesson in front of it. You can press it the way you would press the one on the desk.

- Home screen arithmetic, exponents, roots, π, e, logs, factorials, nCr, nPr, storage into letter variables, Ans, and entry recall.
- 2nd and alpha, including alpha-lock.
- Radian and degree mode. The status bar says which one you are in.
- Y=, window, zoom, trace, table, and a scatter plot from L1 and L2.
- Editable lists, 1-Var Stats, 2-Var Stats, and both linear regressions.
- normalpdf, normalcdf, invNorm, binomial and Poisson probabilities.
- The finance TVM solver, and small matrices with determinant and inverse.

Boot shows TI-84 Plus CE, 5.7.2.0016, RAM Cleared. Any key leaves that screen. A follow-along always starts from a cleared calculator, so an old graph does not leak into the lesson. The standalone calculator remembers its own state in the browser.

The math runs on this machine. There is no call out to a calculation service. Texas Instruments does not publish a TI-84 calculation API, so this does not pretend to use one.

## Run it

```bash
git clone https://github.com/HrishikeshLenin13/calctutor.git
cd calctutor
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build
npm run start
```

## Pages

- `/` type a problem and follow the keys
- `/tutor` the same follow-along
- `/tutor/normal-probability` opened on the area between z = 1 and z = 2
- `/calculator` the keypad on its own
- `/about` what it covers, and the independence notice

## What this is not

CalcTutor is an independent study calculator. It is not a ROM emulator and it is not a Texas Instruments product. No TI firmware is included.

Parametric, polar, and sequence plots are not here. Complex numbers are not here. The full catalog of statistical tests is not here. Distribution values are deterministic approximations, rounded the way the screen shows them.

The keypad is original artwork so the keystrokes can be practiced. It is not a copied product image.

## Independence

CalcTutor is an independent educational project and is not affiliated with, endorsed by, or sponsored by Texas Instruments. TI-84 Plus CE is a trademark of Texas Instruments.
