from flask import Flask, request, send_from_directory
import getKasparV3
from string import Template
import re


app = Flask(__name__, static_folder='', static_url_path='')


@app.route("/")
def index():
    return send_from_directory('', 'index.html')


@app.route("/<path:filename>")
def static_files(filename):
    return send_from_directory('', filename)


@app.route('/genome', methods=['POST'])
def design_from_genome():
    snplist = request.form['list']
    report = []
    for line in snplist.split('\n'):
        match = re.match(r'(\d+)\s(\d+)\s(\w\w)\s?(\w+)?', line.strip())
        if match:
            snp = getKasparV3.from_position(*match.groups())
            report.append(snp.get_primers())
    return generate_report(report)


@app.route('/sequence', methods=['POST'])
def design_from_sequence():
    seqlist = request.form['list']
    report = []
    for line in seqlist.split('\n'):
        parts = line.split(' ')
        seq = parts[-1]
        name = parts[0] if len(parts) > 1 else 'SNP'
        if len(seq) > 50:
            snp = getKasparV3.from_seq(seq, name)
            report.append(snp.get_primers())
    return generate_report(report)


def generate_report(report):
    with open('template.html') as templatefile:
        template = Template(templatefile.read())
        return template.substitute(report='\n'.join(report))


if __name__ == '__main__':
    app.run(debug=True, port=8000)
