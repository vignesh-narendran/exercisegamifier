
const calculateProgress = (earning) => {
    const progressPercent = Math.min(earning / 2500 * 100, 100);
    document.getElementById('progress').style.width = `${progressPercent}%`;
    document.getElementById('totalEarnings').textContent = earning;
}

function calculate() {
    const pushups = Number(document.getElementById('pushups').value);
    const lunges = Number(document.getElementById('lunges').value);
    const squats = Number(document.getElementById('squats').value);
    const wallsits = Number(document.getElementById('wallsits').value);
    const planks = Number(document.getElementById('planks').value);

    const totalActivities = pushups + lunges + squats + wallsits + planks;
    const totalEarnings = totalActivities * 0.5;

    const storedEarnings = localStorage.getItem('pulluppoints');
    const newEarnings = storedEarnings ? Number(storedEarnings) + totalEarnings : totalEarnings;
    localStorage.setItem('pulluppoints', newEarnings);
    calculateProgress(newEarnings);

}

window.onload = function(e){ 
    const storedEarnings = localStorage.getItem('pulluppoints');
    storedEarnings && calculateProgress(storedEarnings);
}

function clearPoints() {
    localStorage.setItem('pulluppoints', 0);
    calculateProgress(0);
}

