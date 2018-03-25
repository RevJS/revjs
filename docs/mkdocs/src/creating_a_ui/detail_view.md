
# Creating a DetailView

You can use a [&lt;DetailView /&gt;](/api/rev-ui/interfaces/idetailviewprops.html),
combined with
[&lt;Field /&gt;](/api/rev-ui/interfaces/ifieldprops.html)s and a
[&lt;SaveAction /&gt;](/api/rev-ui/interfaces/isaveactionprops.html)
to quickly build a form to allow users to edit your model data.

![RevJS Example DetailView](../img/ui-detailview.png)

The data starts loading as soon as the ListView is rendered. A Loading
indicator is shown until the data has finished loading. Once the data is loaded,
the user can use the forward and back buttons to page through the data.

## JSX for a Simple List