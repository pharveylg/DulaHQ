/**
 * Officials Packet — printable PDF for refs to carry when tablet dies
 * P0-4: Cover + per-pitch schedule + 8× blank match reports
 */
import { BRANDING } from '../config/branding.js'

function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }

export function generateOfficialsPacket(S, getTeamById, getRefereeById) {
  const { jsPDF } = window.jspdf || {}
  if (!jsPDF) { alert('PDF lib not loaded'); return }

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = 210, M = 12
  const gold = BRANDING.colors.gold || '#c8960a'
  const accent = BRANDING.colors.accent || '#15803d'
  const tournamentName = (S._tournamentMeta && S._tournamentMeta.name) || (S.tournament && S.tournament.name) || BRANDING.tournament.name || 'Tournament'
  const venue = (S._tournamentMeta && S._tournamentMeta.venue) || S.tournament.venue || ''
  const date = (S._tournamentMeta && S._tournamentMeta.date) || S.tournament.date || ''
  const pitches = (S.tournament && S.tournament.pitches) || []
  const all = []
  // gather all matches across categories (use active category for now, or all if viewAll)
  const cats = S.categories || []
  const list = []
  for (const cat of cats) {
    for (const m of (cat.groupMatches || [])) {
      list.push({ cat: cat.name, m })
    }
  }
  // fallback to S.groupMatches if categories empty (legacy)
  const matches = list.length ? list : (S.groupMatches || []).map(m => ({ cat: 'General', m }))

  // Cover
  doc.setFillColor(255,255,255)
  doc.rect(0,0,W,297,'F')
  // header bar
  doc.setFillColor(accent)
  doc.rect(0,0,W,18,'F')
  doc.setTextColor(255,255,255)
  doc.setFont('helvetica','bold'); doc.setFontSize(14)
  doc.text(BRANDING.appName + ' — ' + BRANDING.tagline, M, 11)
  doc.setFontSize(8); doc.setFont('helvetica','normal')
  doc.text(tournamentName + (venue ? ' · ' + venue : '') + (date ? ' · ' + date : ''), W-M, 11, { align: 'right' })
  // title
  doc.setTextColor(0,0,0)
  doc.setFont('helvetica','bold'); doc.setFontSize(22)
  doc.text('Officials Packet', W/2, 36, { align: 'center' })
  doc.setFont('helvetica','normal'); doc.setFontSize(11)
  doc.text('Pitch schedules · Assignments · Blank Match Reports', W/2, 44, { align: 'center' })
  doc.setFontSize(9); doc.setTextColor(100,100,100)
  doc.text('Print this and carry it — works when the tablet dies', W/2, 50, { align: 'center' })
  // stats
  doc.setTextColor(0,0,0); doc.setFontSize(10)
  const y1 = 62
  doc.setFont('helvetica','bold'); doc.text('Tournament:', M, y1)
  doc.setFont('helvetica','normal'); doc.text(`${tournamentName} · ${matches.length} matches · ${pitches.length} pitches · ${cats.length} categories`, M+28, y1)
  doc.setFont('helvetica','bold'); doc.text('Generated:', M, y1+7)
  doc.setFont('helvetica','normal'); doc.text(new Date().toLocaleString() + ' · ' + (BRANDING.appName), M+28, y1+7)
  // sponsor strip if any
  if (BRANDING.sponsors && BRANDING.sponsors.length) {
    doc.setFontSize(8); doc.setTextColor(120,120,120)
    doc.text('Presented by: ' + BRANDING.sponsors.map(s=>s.name).join(' · '), W/2, y1+14, { align: 'center' })
  }
  // per-pitch schedule
  let y = 82
  const pitchNames = pitches.length ? pitches.map(p=>p.name) : ['Pitch 1']
  for (const pitch of pitchNames) {
    if (y > 250) { doc.addPage(); y = 20 }
    doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.setTextColor(accent)
    doc.text(pitch, M, y)
    doc.setDrawColor(200,200,200); doc.line(M, y+2, W-M, y+2)
    y += 8
    doc.setFont('helvetica','bold'); doc.setFontSize(7); doc.setTextColor(100,100,100)
    doc.text('Time', M, y); doc.text('Grp', M+18, y); doc.text('Home', M+30, y); doc.text('Away', M+85, y); doc.text('Ref', M+130, y); doc.text('Status', M+165, y)
    y += 4
    doc.setFont('helvetica','normal'); doc.setTextColor(0,0,0); doc.setFontSize(7)
    const pitchMatches = matches.filter(x => (x.m.pitchName||'') === pitch).sort((a,b)=> (a.m.kickoff||'').localeCompare(b.m.kickoff||''))
    if (!pitchMatches.length) {
      doc.setTextColor(150,150,150); doc.text('No matches assigned to this pitch yet', M, y); y+=6
    } else {
      for (const {m, cat} of pitchMatches.slice(0,12)) {
        if (y > 270) { doc.addPage(); y = 20 }
        const ht = getTeamById ? getTeamById(m.homeId) : null
        const at = getTeamById ? getTeamById(m.awayId) : null
        const ref = m.refereeId && getRefereeById ? getRefereeById(m.refereeId) : null
        const status = m.played ? 'FT '+m.homeScore+'-'+m.awayScore : (m.inProgress ? 'LIVE' : 'Sched')
        doc.text(m.kickoff || '--:--', M, y)
        doc.text((m.group!==undefined && S.groups && S.groups[m.group] ? S.groups[m.group].name : cat.slice(0,3)), M+18, y)
        doc.text((ht?ht.name:'?').slice(0,22), M+30, y)
        doc.text((at?at.name:'?').slice(0,22), M+85, y)
        doc.text((ref?ref.name:'—').slice(0,18), M+130, y)
        doc.text(status, M+165, y)
        y+=5
      }
    }
    y+=6
  }

  // Blank match reports (8)
  for (let i=0;i<8;i++) {
    doc.addPage()
    doc.setFillColor(accent); doc.rect(0,0,W,14,'F')
    doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(10)
    doc.text('Match Report — Blank', M, 9)
    doc.setFont('helvetica','normal'); doc.setFontSize(7)
    doc.text(tournamentName + ' · ' + (venue||'') , W-M, 9, { align: 'right' })
    doc.setTextColor(0,0,0); doc.setFont('helvetica','normal'); doc.setFontSize(8)
    let ry = 22
    doc.text('Pitch: ________________   Kick-off: ____:____   Date: __________   Referee: ________________________', M, ry); ry+=8
    doc.text('Category: ________________   Group: ______   Round: ________________', M, ry); ry+=8
    doc.setFont('helvetica','bold'); doc.text('Home: _________________________________   Score: ____ — ____   Away: _________________________________', M, ry); ry+=10
    // team tables
    function teamTable(x, y, label) {
      doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.text(label, x, y)
      doc.setFont('helvetica','normal'); doc.setFontSize(6)
      doc.text('#', x, y+5); doc.text('Player', x+8, y+5); doc.text('G', x+55, y+5); doc.text('Y', x+65, y+5); doc.text('R', x+75, y+5)
      doc.setDrawColor(200,200,200); doc.line(x, y+6, x+85, y+6)
      for(let r=0;r<11;r++) {
        const yy = y+10 + r*7
        doc.text(String(r+1), x, yy)
        doc.line(x+6, yy+1, x+52, yy+1)
        doc.rect(x+54, yy-3, 6, 5) // G
        doc.rect(x+64, yy-3, 6, 5) // Y
        doc.rect(x+74, yy-3, 6, 5) // R
      }
      // subs
      doc.setFont('helvetica','bold'); doc.text('Subs:', x, y+10+11*7+4)
      doc.setFont('helvetica','normal')
      for(let s=0;s<3;s++) {
        const yy = y+10+11*7+9 + s*7
        doc.text('Off: _____________ → On: _____________   Min: ____', x, yy)
      }
    }
    teamTable(M, ry, 'HOME')
    teamTable(W/2+2, ry, 'AWAY')
    let by = ry+10+11*7+9+3*7+8
    doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.text('Events Timeline:', M, by); by+=6
    doc.setFont('helvetica','normal'); doc.setFontSize(7)
    for(let e=0;e<10;e++) {
      const yy = by + e*6
      doc.text(`${e+1}.   Min: ____   Team: Home / Away   Player: ______________________   Event: Goal / Yellow / Red / Sub / Pen`, M, yy)
    }
    by += 10*6 + 6
    doc.setFont('helvetica','bold'); doc.text('Notes / Tickler:', M, by); by+=4
    doc.setDrawColor(200,200,200); doc.rect(M, by, W-2*M, 22)
    by+=28
    doc.setFont('helvetica','normal'); doc.setFontSize(7)
    doc.text('Referee signature: ________________________   Commissioner signature: ________________________   Time: ________', M, by)
    doc.setFontSize(6); doc.setTextColor(120,120,120)
    doc.text('Generated by ' + BRANDING.appName + ' · ' + new Date().toLocaleString() + ' · Verify at ' + (typeof location !== 'undefined' ? location.origin : ''), M, 285)
  }

  doc.save((tournamentName.replace(/\s+/g,'_') || 'Tournament') + '_Officials_Packet.pdf')
}
