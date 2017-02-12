<template>
  <div class="col">
    <div class="medium">
      <div class="row">
        <div class="col-10">
          <button class="btn btn-sm btn-secondary"><i class="fa fa-hdd-o"></i> e <i class="fa fa-caret-down"></i></button>
          [files] 65,623,892 k of 628,600,828 k free
        </div>

        <div class="col">
          <i class="pipe">|</i>
          <button class="btn btn-sm btn-link">\</button>
          <button class="btn btn-sm btn-link">..</button>
        </div>
      </div>
    </div>

    <div class="tabs">
      <ul class="nav nav-tabs">
        <li class="nav-item">
          <a class="nav-link" href="#">1977 animals</a>
        </li>
        <li class="nav-item">
          <a class="nav-link active" href="#"><i class="fa fa-music"></i> Music</a>
        </li>
      </ul>
    </div>

    <div class="card border-top-0 rounded-0">
      <div class="location">
        <div class="row">
          <div class="col-10 active">
            <i class="fa fa-caret-down"></i> c:\Users\D\Music\*.*
          </div>
          <div class="col">
            <button class="btn btn-sm btn-link"><i class="fa fa-asterisk"></i></button>
            <button class="btn btn-sm btn-link"><i class="fa fa-caret-down"></i></button>
          </div>
        </div>
      </div>

      <table class="table table-sm mb-0 directory">
        <thead>
          <tr>
            <th><button class="btn btn-block btn-sm btn-link">Name</button></th>
            <th><button class="btn btn-block btn-sm btn-secondary active"><i class="fa fa-long-arrow-up"></i> Ext</button></th>
            <th><button class="btn btn-block btn-sm btn-link">Size</button></th>
            <th><button class="btn btn-block btn-sm btn-link">Date</button></th>
            <th><button class="btn btn-block btn-sm btn-link">Attr</button></th>
          </tr>
        </thead>
        <tfoot>
          <tr>
            <td colspan="5">
              0 k / 43 k in 0 / 12 file(s)
            </td>
          </tr>
        </tfoot>
        <tbody>
          <tr>
            <td><i class="fa fa-level-up"></i> [..]</td>
            <td></td>
            <td>&lt;DIR&gt;</td>
            <td>02/08/2017 00:10</td>
            <td>0755</td>
          </tr>
          <tr>
            <td><i class="fa fa-file-text"></i> clan in da front</td>
            <td>txt</td>
            <td>4,110</td>
            <td>02/01/2017 00:07</td>
            <td>0644</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
