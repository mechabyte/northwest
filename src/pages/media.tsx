import * as React from "react";
import { Link } from "gatsby";
import { StaticQuery, graphql } from "gatsby";
import {
  Header,
  Grid,
  Card,
  List,
  Container,
  Feed,
  Segment,
  Comment
} from "semantic-ui-react";
import { MarkdownRemarkConnection, ImageSharp } from "../graphql-types";
import ProjectTitle from "../components/ProjectTitle";
import TagsCard from "../components/TagsCard/TagsCard";
import ProjectPagination from "../components/ProjectPagination/ProjectPagination";
import { get } from "lodash";
import { withLayout, LayoutProps } from "../components/Layout";
import { MarkdownRemark } from "../graphql-types";

interface MediaProps extends LayoutProps {
  data: {
    tags: MarkdownRemarkConnection;
    media: MarkdownRemarkConnection;
  };
  pageContext: {
    tag?: string; // only set into `templates/tags-pages.tsx`
  };
}

const MediaPage = (props: MediaProps) => {
  const tags = props.data.tags.group;
  const media = props.data.media.edges;
  const { pathname } = props.location;
  const pageCount = Math.ceil(props.data.media.totalCount / 10);

  // TODO export projects in a proper component
  const Projects = (
    <Container>
      {media.map(({ node }: { node: MarkdownRemark }) => {
        const {
          frontmatter,
          timeToRead,
          fields: { slug },
          excerpt
        } = node;
        const cover = get(frontmatter, "image.children.0.fixed", {});

        const extra = (
          <Comment.Group>
            <Comment>
              <Comment.Avatar
                src={avatar.fixed.src}
                srcSet={avatar.fixed.srcSet}
              />
              <Comment.Content>
                <Comment.Author style={{ fontWeight: 400 }}>
                  {frontmatter.author.id}
                </Comment.Author>
                <Comment.Metadata style={{ margin: 0 }}>
                  {frontmatter.updatedDate} - {timeToRead} min read
                </Comment.Metadata>
              </Comment.Content>
            </Comment>
          </Comment.Group>
        );

        const description = (
          <Card.Description>
            {excerpt}
            <br />
            <Link to={slug}>Read more…</Link>
          </Card.Description>
        );

        return (
          <Card
            key={slug}
            fluid
            image={cover}
            header={frontmatter.title}
            extra={extra}
            description={description}
          />
        );
      })}
    </Container>
  );

  return (
    <Container>
      {/* Title */}
      <ProjectTitle />

      {/* Content */}
      <Segment vertical>
        <Grid padded style={{ justifyContent: "space-around" }}>
          <div style={{ maxWidth: 600 }}>
            {Projects}
            <Segment vertical textAlign="center">
              <ProjectPagination
                Link={Link}
                pathname={pathname}
                pageCount={pageCount}
              />
            </Segment>
          </div>
          <div>
            <TagsCard Link={Link} tags={tags} tag={props.pageContext.tag} />
          </div>
        </Grid>
      </Segment>
    </Container>
  );
};

export default withLayout(MediaPage);

export const pageQuery = graphql`
  query PageMedia {
    # Get tags
    tags: allMarkdownRemark(filter: { frontmatter: { draft: { ne: true } } }) {
      group(field: frontmatter___tags) {
        fieldValue
        totalCount
      }
    }

    # Get projects
    projects: allMarkdownRemark(
      sort: { order: DESC, fields: [frontmatter___updatedDate] }
      filter: {
        frontmatter: { draft: { ne: true } }
        fileAbsolutePath: { regex: "/media/" }
      }
      limit: 10
    ) {
      totalCount
      edges {
        node {
          excerpt
          fields {
            slug
          }
          frontmatter {
            title
            updatedDate(formatString: "DD MMMM, YYYY")
            image {
              children {
                ... on ImageSharp {
                  fixed(width: 700, height: 700) {
                    src
                    srcSet
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;
